import { Response } from 'express';
import { Task } from '../models/Task.js';
import { Submission } from '../models/Submission.js';
import { AuthRequest } from '../middleware/auth.js';

// Create a Task (Trainer only)
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, collegeId } = req.body;

    if (!title || !description || !dueDate || !collegeId) {
      res.status(400).json({ message: 'All fields are required (title, description, dueDate, collegeId)' });
      return;
    }

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate),
      college: collegeId,
      trainer: req.user?.id
    });

    await task.save();

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// Retrieve Tasks (Filtered by role)
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.college;

    let filter: any = {};

    if (userRole === 'student') {
      // Students only get tasks for their college
      if (!userCollegeId) {
        res.status(400).json({ message: 'Student does not have an assigned college' });
        return;
      }
      filter.college = userCollegeId;

      const tasks = await Task.find(filter).populate('college').sort({ dueDate: 1 });

      // Fetch student submissions to mark status on task list
      const submissions = await Submission.find({ student: req.user?.id });

      const tasksWithStatus = tasks.map(task => {
        const sub = submissions.find(s => String(s.task) === String(task._id));
        return {
          ...task.toObject(),
          status: sub ? sub.status : 'not_submitted',
          submission: sub || null
        };
      });

      res.status(200).json(tasksWithStatus);
    } else {
      // Trainers get all tasks (or filtered by collegeId query if provided)
      const { collegeId } = req.query;
      if (collegeId) {
        filter.college = collegeId;
      }

      const tasks = await Task.find(filter).populate('college').sort({ dueDate: 1 });

      // Build task statistics (completion rate, status counts)
      const tasksWithStats = await Promise.all(
        tasks.map(async (task) => {
          const subs = await Submission.find({ task: task._id });
          const approved = subs.filter((s) => s.status === 'approved').length;
          const rejected = subs.filter((s) => s.status === 'rejected').length;
          const pending = subs.filter((s) => s.status === 'pending').length;

          return {
            ...task.toObject(),
            stats: {
              totalSubmissions: subs.length,
              approved,
              rejected,
              pending
            }
          };
        })
      );

      res.status(200).json(tasksWithStats);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve tasks', error: error.message });
  }
};
