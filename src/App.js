
import './App.css';
import {
  Switch,
  Route
} from "react-router-dom";
import Home from './containers/Home';
import Room from './containers/Room';
import Conference from './containers/Conference';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/room/:roomName">
          <Room />
        </Route>
        <Route path="/conference/:roomName">
          <Conference />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
