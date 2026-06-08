import { Response } from 'express';
import { Readable } from 'stream';
import csv from 'csv-parser';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { User } from '../models/User.js';
import { College } from '../models/College.js';
import { Task } from '../models/Task.js';
import { Submission } from '../models/Submission.js';
import { AuthRequest } from '../middleware/auth.js';

interface CSVRow {
  name?: string;
  email?: string;
  password?: string;
  collegecode?: string;
  collegename?: string;
}

// Normalized field parser for arbitrary rows
const cleanRow = (row: any): CSVRow => {
  const cleaned: any = {};
  for (const key of Object.keys(row)) {
    const normKey = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
    cleaned[normKey] = row[key];
  }
  return {
    name: cleaned.name || cleaned.fullname || cleaned.studentname,
    email: cleaned.email || cleaned.emailaddress,
    password: cleaned.password || cleaned.pass,
    collegecode: cleaned.collegecode || cleaned.code || cleaned.cc || cleaned.college,
    collegename: cleaned.collegename || cleaned.collegename || cleaned.cn
  };
};

const parseCSV = (buffer: Buffer): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = [];
    const parser = csv({
      mapHeaders: ({ header }) => header.trim().toLowerCase()
    });

    Readable.from(buffer)
      .pipe(parser)
      .on('data', (data) => results.push(cleanRow(data)))
      .on('error', (err) => reject(err))
      .on('end', () => resolve(results));
  });
};

// Unified bulk importer for CSV, JSON, Excel
export const bulkImportStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Roster file is required' });
      return;
    }

    let rawRows: any[] = [];
    const filename = file.originalname.toLowerCase();

    if (filename.endsWith('.csv')) {
      rawRows = await parseCSV(file.buffer);
    } else if (filename.endsWith('.json')) {
      try {
        const jsonContent = JSON.parse(file.buffer.toString('utf-8'));
        const list = Array.isArray(jsonContent) ? jsonContent : [jsonContent];
        rawRows = list.map(cleanRow);
      } catch (err) {
        res.status(400).json({ message: 'Invalid JSON file content' });
        return;
      }
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      try {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        rawRows = sheetData.map(cleanRow);
      } catch (err) {
        res.status(400).json({ message: 'Invalid Excel spreadsheet structure' });
        return;
      }
    } else {
      res.status(400).json({ message: 'Unsupported file format. Use CSV, JSON, or Excel (.xlsx)' });
      return;
    }

    if (!rawRows || rawRows.length === 0) {
      res.status(400).json({ message: 'File is empty or formatted incorrectly' });
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const salt = await bcrypt.genSalt(10);

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const name = row.name?.toString().trim();
      const email = row.email?.toString().trim().toLowerCase();
      const password = row.password?.toString().trim();
      const code = row.collegecode?.toString().trim().toUpperCase();
      const collegeName = row.collegename?.toString().trim() || code;

      if (!name || !email || !password || !code) {
        skippedCount++;
        errors.push(`Row ${i + 2}: Missing required fields (name, email, password, and collegeCode are required)`);
        continue;
      }

      // Check for duplicate student in DB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        skippedCount++;
        errors.push(`Row ${i + 2}: Student with email ${email} already exists`);
        continue;
      }

      try {
        // Find or create College
        let college = await College.findOne({ code });
        if (!college) {
          college = new College({
            name: collegeName || `College ${code}`,
            code
          });
          await college.save();
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, salt);

        // Save new user
        const newStudent = new User({
          name,
          email,
          passwordHash,
          role: 'student',
          college: college._id
        });

        await newStudent.save();
        createdCount++;
      } catch (err: any) {
        skippedCount++;
        errors.push(`Row ${i + 2}: Database error - ${err.message}`);
      }
    }

    res.status(200).json({
      message: `Bulk onboarding complete. Created ${createdCount} students. Skipped ${skippedCount}.`,
      createdCount,
      skippedCount,
      errors
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to process student sheet', error: error.message });
  }
};

// Manual single student registration
export const registerStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, collegeId } = req.body;

    if (!name || !email || !password || !collegeId) {
      res.status(400).json({ message: 'All fields are required (name, email, password, collegeId)' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(400).json({ message: 'Student with this email already exists' });
      return;
    }

    const college = await College.findById(collegeId);
    if (!college) {
      res.status(404).json({ message: 'Selected college does not exist' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const student = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student',
      college: collegeId
    });

    await student.save();

    res.status(201).json({
      message: 'Student registered successfully',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        college: collegeId
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create student record', error: error.message });
  }
};

export const getStudentsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await User.find({ role: 'student' }).populate('college');
    const studentsWithStats = await Promise.all(students.map(async (student) => {
      // Find all tasks for student's college
      const totalTasks = await Task.find({ college: student.college?._id });
      
      // Find all submissions by student
      const submissions = await Submission.find({ student: student._id });
      
      const approved = submissions.filter((s: any) => s.status === 'approved').length;
      const pending = submissions.filter((s: any) => s.status === 'pending').length;
      const rejected = submissions.filter((s: any) => s.status === 'rejected').length;

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        college: student.college,
        stats: {
          totalTasksCount: totalTasks.length,
          approvedCount: approved,
          pendingCount: pending,
          rejectedCount: rejected
        }
      };
    }));

    res.status(200).json(studentsWithStats);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve students performance directory', error: error.message });
  }
};

// Delete student and all submissions
export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      res.status(400).json({ message: 'Student ID is required' });
      return;
    }

    const student = await User.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    if (student.role !== 'student') {
      res.status(403).json({ message: 'Only student accounts can be deleted' });
      return;
    }

    // Delete all submissions by this student
    await Submission.deleteMany({ student: studentId });

    // Delete the student record
    await User.findByIdAndDelete(studentId);

    res.status(200).json({ message: 'Student and related submissions deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
};
