import React, { useState } from "react";
import "./Board.css"
import Tile from "../Tiles/Tile";
import { steps } from "framer-motion";
export interface tileInfo{
    value: number ;
    index : number;
}
function Board(){
    const len = 9;
    
    const generate_array = ()=>{
        return new Array<tileInfo>(len).fill({value:0,index:0}).map((_,i)=>{
        return i;
    }).sort(()=>Math.random()-0.5).map((x,i)=>(
        {value: x, index:i}
    )
)
}
    
    const [matrix,setMatrix] = useState<Array<tileInfo>>(generate_array());
    console.log(matrix)
    
    let states = [[[1, 4, 0], [3, 5, 2], [6, 7, 8]],
    [[1, 4, 2], [3, 5, 0], [6, 7, 8]],
    [[1, 4, 2], [3, 0, 5], [6, 7, 8]],
    [[1, 0, 2], [3, 4, 5], [6, 7, 8]],
    [[0, 1, 2], [3, 4, 5], [6, 7, 8]]]


    

    const delay = (ms:number) => new Promise(resolve => setTimeout(resolve, ms))
    

    const solve_puzzle = async (Steps:number[][][])=>{
        console.log(Steps)
        const states : Array<Array<number>> = Steps.map((array)=>{
            return array.flat()
        })

        for(const state of states){
            const newMatrix: Array<tileInfo> = state.map((number,index)=>{
                return {value: number,index : index}
            })
            setMatrix(newMatrix);
            await delay(1000);
        }
    }

    return (
    
        <div >
            <div className="Board">
                {matrix.map((tileInfo)=>
                <Tile key={tileInfo.value} val={tileInfo.value} index={tileInfo.index}/>
                )}
            </div>

            <button onClick={()=>solve_puzzle(states)}>Solve</button>
        </div>

    )
}
export default Board;