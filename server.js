import express from "express"
const app = express();

import db from './db.js';

import User from './models/user.js';
import Candidate from './models/candidate.js';
import {verifyToken,generateToken} from './models/authentication.js';

import dotenv from 'dotenv'
dotenv.config()

//Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.post('/signup', async (req,res)=>{
    try{

        let data = req.body;
        let user = new User(data);
        let response = await user.save();
        let payload ={
            id:response.id,
        }
        let token = generateToken(payload);
        res.status(200).json({message:"User Registered Successfully",data:response,token:token})
    }catch(error){
        res.status(500).json({message:"Error in User Registration",error:error.message})
    }
})


app.post('/login',async (req,res)=>{
    let {aadhar,password} = req.body;
    try{
        let user = await User.findOne({aadhar:aadhar});
        if(!user || user.password !== password){
            return res.status(401).json({message:"Invalid Credentials"})
        }
        let payload = {
            id: user.id,
        }
        let token = generateToken(payload);
        res.status(200).json({message:"Login Successful",data:user,token:token})
    }catch(error){
        res.status(500).json({message:"Error in User Login",error:error.message})
    }
})

app.get('/profile',verifyToken,async (req,res)=>{
    try{
        let user = await User.findById(req.user.id);
        res.status(200).json({message:"Profile fetched successfully",data:user})
    }catch(error){
        res.status(500).json({message:"Error in fetching profile",error:error.message})
    }
})

app.put('/profile/password',verifyToken,async (req,res)=>{
    try{
        let {oldPassword,newPassword} = req.body;
        let user = await User.findById(req.user.id);
        if(!user || user.password !== oldPassword){
            return res.status(401).json({message:"Invalid Old Password"})
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({message:"Password updated successfully"})
    }
    catch(error){
        res.status(500).json({message:"Error in updating password",error:error.message})
    }
})



//CANDIDATE

let isAdmin = async (user_id)=>{
    let user = await User.findById(user_id);
    if(user.role === "admin"){
        return true;
    }else{
        return false;
    }
}


app.get('/',(req,res)=>{
    res.status(200).json({message:"Welcome to the Voting System API"})
})

app.post('/candidate',verifyToken, async (req,res)=>{
    try{
        if(!await isAdmin(req.user.id)){
            return res.status(403).json({message:"Access Denied"})
        }
        let data = req.body;
        let candidate = new Candidate(data);
        let response = await candidate.save();
        
        res.status(200).json({message:"Candidate Registered Successfully",data:response})
    }catch(error){
        res.status(500).json({message:"Error in Candidate Registration",error:error.message})
    }
})

app.put('/candidate/:id',verifyToken, async (req,res)=>{
    let candidateId = req.params.id;
    try{
        if(!await isAdmin(req.user.id)){
            return res.status(403).json({message:"Access Denied"})
        }
        let data = req.body;
        let candidate = await Candidate.findByIdAndUpdate(candidateId,data,{new:true});
        res.status(200).json({message:"Candidate Updated Successfully",data:candidate})
    }catch(error){
        res.status(500).json({message:"Error in Candidate Update",error:error.message})
    }
})

app.delete('/candidate/:id',verifyToken, async (req,res)=>{
    let candidateId = req.params.id;
    try{
        if(!await isAdmin(req.user.id)){
            return res.status(403).json({message:"Access Denied"})
        }
        let candidate = await Candidate.findByIdAndDelete(candidateId);
        res.status(200).json({message:"Candidate Deleted Successfully",data:candidate})
    }catch(error){
        res.status(500).json({message:"Error in Candidate Deletion",error:error.message})
    }
})


//VOTING FUNCTIONALITY

app.post('/vote/:candidateId',verifyToken, async (req,res)=>{
    try{
        let candidateId = req.params.candidateId;
        let user = await User.findById(req.user.id);
        if(user.isVoted===true){
            return res.status(400).json({message:"User has already voted"})
        }
        let candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message:"Candidate not found"})
        }
        if(user.role === "admin"){
            return res.status(403).json({message:"Admin cannot vote"})
        }
        candidate.votes.push({user:user._id});
        candidate.voteCount += 1;
        await candidate.save();
        user.isVoted = true;
        await user.save();
        res.status(200).json({message:"Vote casted successfully"})
    }
    catch(error){
        res.status(500).json({message:"Error in Voting",error:error.message})
    }
})

app.get('/results',verifyToken, async (req,res)=>{
    try{
        if(await isAdmin(req.user.id)){
            return res.status(403).json({message:"Access Denied"})
        }
        let candidates = await Candidate.find().sort({voteCount:'desc'});

        let results = candidates.map(candidate=>{
            return {
                party:candidate.party,
                votes:candidate.voteCount
            }
        } 
    )
        res.status(200).json({message:"Results fetched successfully",data:results})
    }catch(error){
        res.status(500).json({message:"Error in fetching results",error:error.message})
    }
})

app.get('/candidates',verifyToken, async (req,res)=>{
    try{
        if(await isAdmin(req.user.id)){
            return res.status(403).json({message:"Access Denied"})
        }
        let candidates = await Candidate.find();

        let data = candidates.map(candidate=>{
            return {
                name:candidate.name,
                
            }
        })
        res.status(200).json({message:"Candidates fetched successfully",data:data})
    }catch(error){
        res.status(500).json({message:"Error in fetching candidates",error:error.message})
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})