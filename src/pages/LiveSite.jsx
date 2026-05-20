import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const LiveSite = () => {
    const { id } = useParams();

    const [html, setHtml] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/website/getBySlug/${id}`, {
                    withCredentials: true
                })
                setHtml(res.data.latestCode);
            } catch (error) {
                console.log(error);
                setError(error.response.data.message);
                console.log(setError(error.response.data.message));
            }
        }
        handleGetWebsite();
    }, []);

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-white'>
                {error}
            </div>
        );
    }

    return (
        <iframe
            title='Live Site'
            srcDoc={html}
            className='w-screen h-screen border-none'
            sandbox='allow-scripts allow-forms' />
    );
}