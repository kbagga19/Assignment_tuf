import React, {useEffect, useState} from "react";
import axios from 'axios';

const DisplayPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [outputMap, setOutputMap] = useState({});
    
    useEffect(() => {
        fetchSubmissions();
    }, [])

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/submissions');
            setSubmissions(response.data);
        } catch (err) {
            console.error(err)
        }
    };

    const displayOutput = async (submission) => {
        try {
            const { username, language, code, stdin } = submission;
            const executeResponse = await axios.post('http://localhost:8080/output', {
                language,
                code,
                stdin
            });
            const stdout = executeResponse.data.stdout;
            setOutputMap((prevStdoutMap) => ({ ...prevStdoutMap, [username]: stdout }));
            
        } catch (err) {
            console.error('Error executing code:', err);
        }
    };
    console.log(submissions.output)
    return (
        <div className="table-container">
        <h1>Submitted Code Snippets</h1>
        <table className="code-table">
            <thead>
            <tr>
                <th>Username</th>
                <th>Language</th>
                <th>Input</th>
                <th>Source Code</th>
                <th>Timestamp</th>
                <th>Output</th>
            </tr>
            </thead>
            <tbody>
            {submissions.map((submission, index) => (
                <tr key={index}>
                    <td>{submission.username}</td>
                    <td>{submission.language}</td>
                    <td>{submission.stdin}</td>
                    <td>{submission.code.slice(0, 100)}</td>
                    <td>{new Date(submission.timestamp).toLocaleString()}</td>
                    <td>{outputMap[submission.username] || ''}</td>    
                    <td style={{borderBottom: 'none'}}>
                        <button className='execute-btn' onClick={() => displayOutput(submission)}>Execute</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};

export default DisplayPage;
