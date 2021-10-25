import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

// Component
import { TextField, MenuItem } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  marginFilter: {
    margin: "10px 10px 10px 0",
    width: "150px",
  },
}));

export default function FilterTime({ initialData, setData }) {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const menuList = [
    { text: "ทั้งหมด", days: 0 },
    { text: "ภายใน 24 ชั่วโมง", days: 1 },
    { text: "มากกว่า 1 อาทิตย์", days: 7 },
    { text: "มากกว่า 1 เดือน", days: 30 },
    { text: "มากกว่า 3 เดือน", days: 90 },
    { text: "มากกว่า 5 เดือน", days: 150 },
  ];
 
  const onChange = async (e) => {
    let inputValue = e.target.value;
    // let currentDate = new Date(new Date().getTime() + 1000 * 60 * (1440 * 180))
    setValue(inputValue);

    if (inputValue === 0) {
      setData(initialData);
    } else if(inputValue === 1) {
      // 86,400,000 = 1 day
      let dateFormat = new Date(new Date().getTime());
      function createdDate(d) {
        return new Date(d).getTime() + 86400000;
    }
      let newData = await initialData.filter((item) => dateFormat <= createdDate(item.date));
      setData(newData)
    }
     else {
        let dateFormat = new Date(new Date().getTime());
        function createdDate(d) {
            return new Date(d).getTime() + 1000 * 60 * (1440 * inputValue)
        }
        let newData = await initialData.filter((item) => createdDate(item.date) <= dateFormat);
        setData(newData)
    }
  };

  return (
    <TextField
      id="standard-select-currency"
      select
      label="ระยะเวลา"
      onChange={onChange}
      value={value}
      className={classes.marginFilter}
    >
      {menuList.map((option) => (
        <MenuItem key={option.days} value={option.days}>
          {option.text}
        </MenuItem>
      ))}
    </TextField>
  );
}
