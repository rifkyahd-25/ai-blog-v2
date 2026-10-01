import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, updatepost, deletepost, getposts, getall } from '../controllers/post.controller.js';


const router = express.Router();
router.post('/create', verifyToken, create);
router.get('/getposts', getposts)
router.get('/getall', getall)
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost)
export default router;