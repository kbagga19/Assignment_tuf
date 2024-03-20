import './App.css';
import CodeSubmissionForm from './components/CodeSubmissionForm'
import DisplayPage from './components/DisplayPage'
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className='app-container'>
      <Routes>
        <Route exact path="/" element={<CodeSubmissionForm/>}></Route>
        <Route path="/displayPage" element={<DisplayPage/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
