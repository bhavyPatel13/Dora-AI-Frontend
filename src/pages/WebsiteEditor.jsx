import axios from 'axios';
import { Code2, MessageSquare, Monitor, Rocket, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from "@monaco-editor/react"

export const WebsiteEditor = () => {
    const { id } = useParams();
    const iframeRef = useRef(null);

    const [website, setWebsite] = useState(null);
    const [error, setError] = useState("");
    const [code, setCode] = useState("");
    const [messages, setMessages] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showCode, setShowCode] = useState(false);
    const [showFullPreview, setShowFullPreview] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [thinkingIndex, setThinkingIndex] = useState(0);

    const thinkingSteps = [
        "Understanding your request...",
        "Planning layout changes...",
        "Improving responsiveness...",
        "Applying animations...",
        "Finalizing Update..."
    ];

    useEffect(() => {
        if (!updateLoading) return;
        const intervalId = setInterval(() => {
            setThinkingIndex((index) => (index + 1) % thinkingSteps.length);
        }, 1200);
        return () => clearInterval(intervalId);
    }, [updateLoading]);

    useEffect(() => {
        const handalGetWebsite = async () => {
            try {
                setLoading(true);
                const result = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/website/getById/${id}`, {
                    withCredentials: true
                });
                setWebsite(result.data);
                setCode(result.data.latestCode);
                setMessages(result.data.conversation);
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Something went wrong";
                setError(errorMsg);
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        handalGetWebsite();
    }, [id]);

    useEffect(() => {
        if (!iframeRef.current || !code) return;
        const blob = new Blob([code], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        iframeRef.current.src = url;
        return () => URL.revokeObjectURL(url);
    }, [code]);

    const handleUpdate = async () => {
        if (!prompt.trim()) return;

        const currentPrompt = prompt;
        setPrompt("");

        setMessages((m) => [...m, {
            role: "user",
            content: currentPrompt
        }]);
        setUpdateLoading(true);
        try {
            const result = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/website/update/${id}`, { prompt: currentPrompt }, {
                withCredentials: true
            });
            setMessages((m) => [...m, {
                role: "ai",
                content: result.data.message
            }]);
            setCode(result.data.code);
        } catch (error) {
            console.error(error);
        } finally {
            setUpdateLoading(false);
        }
    }

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

    if (!website) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-red-400'>Loading...</div>
        );
    }

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-red-400'>{error}</div>
        );
    }

    return (
        <div className='h-screen w-screen flex bg-black text-white overflow-hidden'>
            <aside className='hidden lg:flex w-95 flex-col border border-white/10 bg-black/80'>
                <Header />
                <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, index) => {
                            return <div key={index} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-200"}`}>
                                    {m.content}
                                </div>
                            </div>
                        })}
                        {updateLoading && (
                            <div className='max-w-[85%] mt-auto animate-pulse'>
                                <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>
                                    {thinkingSteps[thinkingIndex]}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='p-3 border-t border-white/10'>
                        <div className='flex gap-2'>
                            <textarea
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleUpdate();
                                    }
                                }}
                                rows={1}
                                placeholder='Describe changes...'
                                className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none' />
                            <button
                                disabled={updateLoading}
                                onClick={handleUpdate}
                                className='px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-40 transition'>
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </>
            </aside>

            {/* Preview Frame */}
            <div className='flex-1 flex flex-col'>
                <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80'>
                    <span className='text-xs text-zinc-400'>Live Preview</span>
                    <div className='flex gap-4 items-center'>
                        {/* FIXED: Replaced implicit evaluation string ternary filter branch */}
                        {website?.deployed ? (
                            <a
                                href={website.deployUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className='text-xs text-indigo-400 hover:underline flex items-center gap-1'
                            >
                                Live Link ↗
                            </a>
                        ) : (
                            <button
                                onClick={() => handleDeploy(id)}
                                className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition cursor-pointer'
                            >
                                <Rocket size={14} /> Deploy
                            </button>
                        )}

                        <button onClick={() => setShowChat(true)} className='p-2 lg:hidden'><MessageSquare size={18} /></button>

                        <button onClick={() => setShowCode(!showCode)} className={`${showCode ? 'text-indigo-400' : 'text-zinc-400'} hover:text-white transition cursor-pointer`}>
                            <Code2 size={18} />
                        </button>

                        <button onClick={() => setShowFullPreview(true)} className='text-zinc-400 hover:text-white cursor-pointer transition'><Monitor size={18} /></button>
                    </div>
                </div>
                <iframe
                    ref={iframeRef}
                    className='flex-1 w-full bg-white border-none'
                    sandbox='allow-scripts allow-forms allow-same-origin'
                    title="Live App Preview"
                />
            </div>

            {/* Mobile Chat Preview Overlay */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: "0" }}
                        exit={{ y: "100%" }}
                        className='fixed inset-0 z-9999 flex flex-col bg-black'>
                        <Header />
                        <>
                            <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                                {messages.map((m, index) => {
                                    return <div key={index} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-200"}`}>
                                            {m.content}
                                        </div>
                                    </div>
                                })}
                                {updateLoading && (
                                    <div className='max-w-[85%] mt-auto animate-pulse'>
                                        <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>
                                            {thinkingSteps[thinkingIndex]}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='p-3 border-t border-white/10'>
                                <div className='flex gap-2'>
                                    <textarea
                                        value={prompt}
                                        onChange={(event) => setPrompt(event.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleUpdate();
                                            }
                                        }}
                                        rows={1}
                                        placeholder='Describe changes...'
                                        className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-white focus:outline-none' />
                                    <button
                                        disabled={updateLoading}
                                        onClick={handleUpdate}
                                        className='px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-40 transition'>
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sliding Monaco Editor Panel */}
            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className='fixed inset-y-0 right-0 w-full lg:w-[45%] z-9999 flex flex-col bg-[#1e1e1e] border-l border-white/10 shadow-2xl'>
                        <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-[#1e1e1e]'>
                            <span className='text-xs font-semibold text-zinc-400 '>index.html</span>
                            <button onClick={() => setShowCode(false)} className='text-zinc-400 hover:text-white transition'>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 w-full pt-2">
                            <Editor
                                theme='vs-dark'
                                value={code}
                                language='html'
                                onChange={(v) => setCode(v || "")}
                                options={{
                                    wordWrap: "on",
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    automaticLayout: true
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFullPreview && (
                    <div className='fixed inset-0 bg-black z-9999'>
                        <iframe srcDoc={code} className='w-full h-full bg-white' sandbox='allow-scripts allow-forms allow-same-origin' />
                        <button
                            className='absolute top-4 right-4 p-2 bg-black/70 rounded-lg cursor-pointer text-white'
                            onClick={() => setShowFullPreview(false)}>
                            <X />
                        </button>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );

    function Header() {
        return (
            <div className='h-14 px-4 flex items-center justify-between border-b border-white/10'>
                <span className='font-semibold truncate'>{website?.title}</span>
                <button onClick={() => setShowChat(false)} className='lg:hidden'><X /></button>
            </div>
        );
    }
}