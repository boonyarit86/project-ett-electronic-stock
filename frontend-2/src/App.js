import './App.css';
import Heading from './Components/Text/Heading';
import Title from './Components/Text/Title';
import Test from './Test';

function App() {
  return (
    <div className="App">
      <p>Hi</p>

      <Test>
        <Heading type="main" text="Heading 1" />
        <Heading type="sub" text="Heading 2" />
        <Title>Hello Dev!!!!</Title>
      </Test>
    </div>
  );
}

export default App;
