import axios from 'axios';
import { ArrowLeft, Check, Rocket, Share2 } from 'lucide-react';
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
    const [copiedId, setCopiedId] = useState(null);

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

    const handleDeploy = async (targetId) => {
        const deploymentId = targetId || id;
        const newTab = window.open("about:blank", "_blank");

        try {
            const result = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/website/deploy/${deploymentId}`,
                { withCredentials: true }
            );

            if (result.data?.url) {
                newTab.location.href = result.data.url;
                setWebsite((prev) => prev ? { ...prev, deployed: true, deployUrl: result.data.url } : prev);
            } else {
                throw new Error("No URL returned from server deployment system.");
            }
        } catch (error) {
            if (newTab) newTab.close();
            const errorMsg = error.response?.data?.message || error.message || "Deployment pipeline failed";
            setError(errorMsg);
            console.error("Deployment Error:", error);
        }
    };

    const handleCopy = async (site) => {
        await navigator.clipboard.writeText(site.deployUrl);
        setCopiedId(site._id);
        setTimeout(() => {
            setCopiedId(null);
        }, 2000);
    }

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
                {loading && <div className='mt-24 text-center text-zinc-400'>Loading your websites...</div>}
                {error && !loading && <div className='mt-24 text-center text-red-400'>{error}</div>}
                {websites.length === 0 && <div className='mt-24 text-center text-zinc-400'>You have no websites.</div>}
                {websites.length > 0 &&
                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
                        {websites.map((w, i) => {
                            const copied = copiedId === w._id;
                            return <motion.div
                                key={w._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -6 }}
                                onClick={() => navigate(`/editor/${w._id}`)}
                                className='rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition flex flex-col' >
                                <div className='relative h-40 bg-black cursor-pointer'>
                                    <iframe srcDoc={w.latestCode} className='absolute inset-0 w-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white' />
                                    <div className='absolute inset-0 bg-black/30' />
                                </div>
                                <div className='p-5 flex flex-col gap-4 flex-1'>
                                    <h3 className='text-base font-semibold line-clamp-2'>{w.title}</h3>
                                    <p>Last Updated {""}
                                        {new Date(w.updatedAt).toLocaleDateString()}
                                    </p>
                                    {
                                        !w.deployed ? (
                                            <button
                                                onClick={handleDeploy(deploymentId)}
                                                className='mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-indigo-500 to-purple-500 hover:scale-105 transition'><Rocket size={18} />Deploy</button>
                                        ) : (
                                            <motion.button
                                                onClick={(event) => { event.stopPropagation(), handleCopy(w) }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${copied ?
                                                    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                    "bg-white/10 hover:bg-white/20 border border-white/10"}`}>
                                                {copied ? <>
                                                    <Check size={14} />Link Copied
                                                </> : <>
                                                    <Share2 size={14} />Share Link
                                                </>}
                                            </motion.button>
                                        )
                                    }
                                </div>
                            </motion.div>
                        })}
                    </div>
                }
            </div>
        </div>
    );
}