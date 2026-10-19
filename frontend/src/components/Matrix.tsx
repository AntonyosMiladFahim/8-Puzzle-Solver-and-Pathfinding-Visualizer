import React, { useState } from "react";
import "./Matrix.css"
import MatrixGrid from "./matrixGrid";

function Matrix(){
    const len = 9;
    const [matrix,setMatrix] = useState<Array<number>>(Array.from({ length: len },()=>Math.floor(Math.random()*(10-1+1) + 1)));
    const [clickOrder,setClickOrder] = useState<Array<number>>([])



    return (
        
    <div className="matrix">
        {
            matrix.map((value,index) =>(
                <MatrixGrid key={index} initial_val={value}/>
            ))
        }
    </div>
    )
}
export default Matrix;