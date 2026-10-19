import { useState } from "react";
import "./Matrix.css";

type MatrixGridProps = {
    initial_val: number;

};

function matrixGrid({ initial_val }: MatrixGridProps) {
    const [value,setValue] = useState<number>(initial_val);


    const handle_onChange = (value:number)=>{
        const newValue = value;
        setValue(newValue);
    }
    
    return <div className="box">{value}</div>;
}

export default matrixGrid;