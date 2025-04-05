import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    personality: '',
    preferences: [],
    occasion: ''
  });
  const [suggestions, setSuggestions] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        preferences: checked
          ? [...formData.preferences, value]
          : formData.preferences.filter((pref) => pref !== value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit form and fetch suggestions
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/gift-suggestions', formData);
      setSuggestions(response.data);
      setStep(2);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Render questionnaire
  if (step === 1) {
    return (
      <div className="App">
        <h1>Personalized Gift Recommendation Platform </h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Recipient's Personality:</label><br />
            <select name="personality" value={formData.personality} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="thoughtful">Thoughtful</option>
              <option value="adventurous">Adventurous</option>
              <option value="tech-savvy">Tech-Savvy</option>
              <option value="sentimental">Sentimental</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <label>Preferences (select all that apply):</label><br />
            <input type="checkbox" name="preferences" value="reading" onChange={handleChange} /> Reading<br />
            <input type="checkbox" name="preferences" value="technology" onChange={handleChange} /> Technology<br />
            <input type="checkbox" name="preferences" value="personalized" onChange={handleChange} /> Personalized Items
          </div>

          <div>
            <label>Occasion:</label><br />
            <select name="occasion" value={formData.occasion} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
              <option value="holiday">Holiday</option>
            </select>
            </div>

          <button type="submit">Get Gift Suggestions</button>
        </form>
      </div>
    );
  }

  // Render suggestions
  return (
    <div className="App">
      <h1>Your Gift Suggestions</h1>
      {suggestions && (
        <ul>
          {suggestions.suggestions.map((gift, index) => (
            <li key={gift.id}>
              <strong>{gift.name}</strong> - ${gift.price}<br />
              {suggestions.explanations[index]}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => setStep(1)}>Try Again</button>
     
    </div>
  );
}

export default App;