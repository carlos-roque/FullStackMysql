import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [carName, setCarName] = useState('');
  const [model, setModel] = useState('');
  const [editingCar, setEditingCar] = useState(null); // State for editing
  const [error, setError] = useState(null);

  // Fetch cars on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/cars'); // Use relative URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCars(data);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error("Could not fetch cars:", error);
        setError(error.message); // Set the error message
      }
    }
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Handle form submission (Add or Edit)
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingCar) {
        // Edit existing car
        const response = await fetch(`/api/cars/${editingCar.id}`, {  // Use relative URL
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ carName, model }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Update car in the list
        setCars(cars.map(car => car.id === editingCar.id ? { ...car, car_name: carName, model } : car));
        setEditingCar(null); // Exit edit mode
      } else {
        // Add new car
        const response = await fetch('/api/cars', { // Use relative URL
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ carName, model }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const newData = await response.json();
        setCars([...cars, { car_name: carName, model, id: newData.id }]);
      }

      setCarName('');
      setModel('');
      setError(null);
    } catch (error) {
      console.error("Error adding/editing car:", error);
      setError(error.message);
    }
  };

  // Handle delete car
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/cars/${id}`, { // Use relative URL
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Remove car from the list
      setCars(cars.filter(car => car.id !== id));
      setError(null); //Clear Errors
    } catch (error) {
      console.error("Error deleting car:", error);
      setError(error.message);
    }
  };

  // Handle edit car (set editing state)
  const handleEdit = (car) => {
    setEditingCar(car);
    setCarName(car.car_name);
    setModel(car.model);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCar(null);
    setCarName('');
    setModel('');
  }

  return (
    <div className="App">
      <h1>Add a Car</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="carName">Car Name:</label>
          <input
            type="text"
            id="carName"
            value={carName}
            onChange={(e) => setCarName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="model">Model:</label>
          <input
            type="text"
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </div>
        <button type="submit">{editingCar ? 'Save Changes' : 'Add Car'}</button>
        {editingCar && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
      </form>

      {error && <div className="error">{error}</div>}

      <h2>Cars</h2>
      <ul>
        {cars.map((car) => (
          <li key={car.id}>
            {car.car_name} - {car.model} (ID: {car.id})
            <button onClick={() => handleEdit(car)}>Edit</button>
            <button onClick={() => handleDelete(car.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;