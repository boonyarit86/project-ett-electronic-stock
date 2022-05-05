import "./App.css";
import Input from "./Components/InputWithValidator/InputWithValidator";
import Heading from "./Components/Text/Heading";
import Title from "./Components/Text/Title";
import Test from "./Test";
import { useForm } from "./hooks/form-hook";
import { VALIDATOR_REQUIRE } from "./utils/validators";
import Auth from "./Pages/Auth/Auth";

function App() {
  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
      },
    },
    {
      type: {
        value: false,
        isValid: false,
      },
    },
    false
  );

  return (
    <div className="App">
      <Auth />
      {/* <Test>
        <Heading type="main" text="Heading 1" />
        <Heading type="sub" text="Heading 2" />
        <Title>Hello Dev!!!!</Title>
        <h3>Input</h3>
        <Input
          element="input"
          type="email"
          label="อีเมล์"
          name="email"
          placeholder="กรุณากรอกอีเมล์ของคุณ"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="โปรดใส่ข้อมูล."
          onInput={inputHandler}
          errorMessage="กรุณากรอกอีเมล์ของคุณ"
          required
          fullWidth
        />
      </Test> */}
    </div>
  );
}

export default App;
