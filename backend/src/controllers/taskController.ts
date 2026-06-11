import { Response } from 'express';
import { Task } from '../models/Task.js';
import { Submission } from '../models/Submission.js';
import { AuthRequest } from '../middleware/auth.js';

// Create a Task (Trainer only)
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, collegeId } = req.body;

    if (!title || !description || !dueDate) {
      res.status(400).json({ message: 'Title, description, and dueDate are required' });
      return;
    }

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate),
      college: collegeId || null, // Allow global tasks (null/empty collegeId)
      trainer: req.user?.id
    });

    await task.save();

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// Update a Task (Trainer only)
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { title, description, dueDate, collegeId } = req.body;

    if (!taskId) {
      res.status(400).json({ message: 'Task ID is required' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (collegeId !== undefined) {
      task.college = collegeId ? collegeId : null;
    }

    await task.save();

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// Retrieve Tasks (Filtered by role)
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.college;

    if (userRole === 'student') {
      let filter: any = {};
      if (userCollegeId) {
        filter.$or = [
          { college: userCollegeId },
          { college: { $exists: false } },
          { college: null }
        ];
      } else {
        filter.$or = [
          { college: { $exists: false } },
          { college: null }
        ];
      }

      // Read-only optimized query
      const tasks = await Task.find(filter).populate('college').sort({ dueDate: 1 }).lean();

      // Fetch student submissions to mark status on task list
      const submissions = await Submission.find({ student: req.user?.id }).lean();

      const tasksWithStatus = tasks.map(task => {
        const sub = submissions.find(s => String(s.task) === String(task._id));
        return {
          ...task,
          status: sub ? sub.status : 'not_submitted',
          submission: sub || null
        };
      });

      res.status(200).json(tasksWithStatus);
    } else {
      // Trainers get all tasks (or filtered by collegeId query if provided)
      let filter: any = {};
      const { collegeId } = req.query;
      
      if (collegeId && collegeId !== 'all') {
        filter.college = collegeId;
      }

      // Read-only optimized query
      const tasks = await Task.find(filter).populate('college').sort({ dueDate: 1 }).lean();

      if (tasks.length === 0) {
        res.status(200).json([]);
        return;
      }

      const taskIds = tasks.map(t => t._id);

      // Optimize N+1 DB Queries via a single aggregation pipeline
      const statsAgg = await Submission.aggregate([
        { $match: { task: { $in: taskIds } } },
        {
          $group: {
            _id: '$task',
            totalSubmissions: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]);

      const statsMap = new Map();
      statsAgg.forEach(stat => {
        statsMap.set(String(stat._id), {
          totalSubmissions: stat.totalSubmissions,
          approved: stat.approved,
          rejected: stat.rejected,
          pending: stat.pending
        });
      });

      const tasksWithStats = tasks.map(task => {
        const stats = statsMap.get(String(task._id)) || {
          totalSubmissions: 0,
          approved: 0,
          rejected: 0,
          pending: 0
        };
        return {
          ...task,
          stats
        };
      });

      res.status(200).json(tasksWithStats);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve tasks', error: error.message });
  }
};

// Delete a Task and all its associated submissions (Trainer only)
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      res.status(400).json({ message: 'Task ID is required' });
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Delete all submissions for this task
    await Submission.deleteMany({ task: taskId });

    // Delete the task record itself
    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: 'Task and all related submissions deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};
