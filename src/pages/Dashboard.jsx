import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";

export const Dashboard = () => {
    const navigate = useNavigate();

    // Safety Note: If userData is an object, remember to target a key like userData.name below!
    const { userData } = useSelector(state => state.user);

    const [loading, setLoading] = useState(false);
    const [websites, setWebsites] = useState([]); // Initialized as an empty array instead of null for safe loop mapping
    const [error, setError] = useState("");

    const handalGetAllWebsite = async () => {
        try {
            setLoading(true);
            setError(""); // Clear any old errors on refresh

            const result = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/website/getall`, {
                withCredentials: true
            });

            setWebsites(result.data);
            console.log(result);
        } catch (error) {
            // Fixed typo typo from error.responce -> error.response
            const errorMsg = error.response?.data?.message || error.message || "Something went wrong";
            setError(errorMsg);
            console.error("error => ", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handalGetAllWebsite();
    }, []);

    return (
        <div className='min-h-screen bg-[#050505] text-white'>
            {/* Header */}
            <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10'>
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => navigate("/")}
                            className='p-2 rounded-lg hover:bg-white/10 transition'>
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className='text-lg font-semibold'>Dashboard</h1>
                    </div>
                    <button
                        onClick={() => navigate("/generate")}
                        className='px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition'>
                        + New Website
                    </button>
                </div>
            </div>

            <div className='px-6 py-10 max-w-7xl mx-auto'>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-10'>
                    <p className='text-sm text-zinc-400 mb-1'>Welcome Back</p>
                    <h1 className='text-3xl font-bold\'>
                        {userData.name}
                    </h1>
                </motion.div>
            </div>
        </div>
    );
}