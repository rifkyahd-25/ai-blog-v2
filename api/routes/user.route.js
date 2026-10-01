import express from 'express';
import { signout, deleteUser, updateUser,getUser, getUsers } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/all', verifyToken, getUsers);
router.get('/:userId', getUser)

export default router;

