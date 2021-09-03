
import './App.css';
import {
  Switch,
  Route
} from "react-router-dom";
import Home from './Home';
import Room from './Room';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/room/:roomName">
          <Room />
        </Route>

        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
