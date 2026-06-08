import { Request, Response } from 'express';
import { College } from '../models/College.js';

export const getColleges = async (req: Request, res: Response): Promise<void> => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.status(200).json(colleges);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve colleges', error: error.message });
  }
};

export const createCollege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      res.status(400).json({ message: 'College name and code are required' });
      return;
    }

    const uppercaseCode = code.toUpperCase().trim();
    const existingCollege = await College.findOne({ code: uppercaseCode });
    if (existingCollege) {
      res.status(400).json({ message: `College with code ${uppercaseCode} already exists` });
      return;
    }

    const college = new College({
      name: name.trim(),
      code: uppercaseCode
    });

    await college.save();
    res.status(201).json({ message: 'College created successfully', college });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create college', error: error.message });
  }
};
