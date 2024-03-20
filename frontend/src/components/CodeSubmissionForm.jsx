import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const CodeSubmissionForm = () => {
    const [username, setUsername] = useState('');
    const [language, setLanguage] = useState('');
    const [stdin, setStdin] = useState('');
    const [code, setCode] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/submit', { username, language, stdin, code });
            alert('Code submitted successfully!');
            setUsername('');
            setLanguage('');
            setStdin('');
            setCode('');
        } catch (err) {
            console.error(err);
            alert('Error submitting code');
        }
    };

    return (
        <div className='form-container'>
            <h1>Code Submission</h1>
            <form onSubmit={handleSubmit} className='code-form'>
            <label>
                Username:
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </label>
            <label>
                Language:
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="">Select a language</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                </select>
            </label>
            <label>
                Standard Input:
                <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                ></textarea>
            </label>
            <label>
                Source Code:
                <textarea
                    className='sourceCodeInput'
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                ></textarea>
            </label>
            <button type="submit" className='submit-btn'>Submit</button>
            </form>
            <button className='view-btn' onClick={() => {navigate("/displayPage")}}>View Table</button>
        </div>
    );
};

export default CodeSubmissionForm;