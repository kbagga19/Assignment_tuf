const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const redis = require('redis');
const { promisify } = require('util');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Baggaji19@',
    database: 'striver'
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Redis connection
let redisClient;
(async () => {
    redisClient = redis.createClient();
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
    redisClient.on('connect', () => {
        console.log('Redis client connected');
    });
    await redisClient.connect();
})();

const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisSetAsync = promisify(redisClient.set).bind(redisClient);

//Add data from the form to database
app.post('/submit', async (req, res) => {
    const { username, language, stdin, code } = req.body;
    const timestamp = new Date().toISOString()

    const query = 'INSERT INTO submissions (username, language, stdin, code, timestamp) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [username, language, stdin, code, timestamp], (err, result) => {
        if (err) {
        console.error(err);
        res.status(500).send('Error submitting code');
        } else {
        res.status(200).send('Code submitted successfully');
        }
    });
    
    //Save in redis cache
    const submissionData = JSON.stringify({ username, language, stdin, code, timestamp });
    redisSetAsync(result.insertId, submissionData);
    res.status(200).json({ message: 'Code submitted successfully' });
});

//Fetch submissions
app.get('/submissions', async (req, res) => {
    try {
        //From redis cache
        const keys = await util.promisify(redisClient.keys).bind(redisClient)('*');
        const submissions = await Promise.all(keys.map(async (key) => {
          const submissionData = await redisGetAsync(key);
          return JSON.parse(submissionData);
        }));
    
        res.status(200).json(submissions);
    } catch (err) {
        console.error('Redis error:', err);
    
        //If not from redis then fetch from database 
        const query = 'SELECT id, username, language, stdin, code, timestamp FROM submissions';
        connection.query(query, (err, results) => {
          if (err) throw err;
          res.status(200).json(results);
        });
    }
});

//Get Output of the code
app.post('/output', async (req, res) => {
    const { language, code, stdin } = req.body;
    const languageId = getLanguageId(language);
  
    //Send the data to API which in response gives a token
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: {
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'content-type': 'application/json',
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': '2f53bbd409mshc8d73d6e139caa6p1e53f5jsn63378d78a7f8',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
            language_id: languageId,
            source_code: Buffer.from(code).toString('base64'),
            stdin: Buffer.from(stdin).toString('base64')
        }
    };
  
    try {
        const response = await axios.request(options);
        const token = response.data.token;

        // Get the output using the token
        const outputOptions = {
            method: 'GET',
            url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            params: {
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'X-RapidAPI-Key': '2f53bbd409mshc8d73d6e139caa6p1e53f5jsn63378d78a7f8',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        };
        try {
            const outputResponse = await axios.request(outputOptions);
            if (outputResponse.data.stdout != null) {
                const stdout = Buffer.from(outputResponse.data.stdout, 'base64').toString();
                res.status(200).json({ stdout });
            }
        } catch (error) {
            console.log(error)
        }
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error executing code' });
    }
});
  
// Get language ID for Judge0 API getLanguages
function getLanguageId(language) {
    switch (language) {
        case 'cpp':
        return 48;
        case 'java':
        return 91;
        case 'javascript':
        return 93;
        case 'python':
        return 92;
        default:
        return null;
    }
}

app.listen(8080, () => {
    console.log(`Server is running on port 8080`);
});