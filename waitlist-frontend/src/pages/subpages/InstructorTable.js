import React from 'react';

function InstructorTable({headers, data}) {

  if (!data.length) {
    return <div></div>;
  }

  let count = 1;
  const columns = Object.keys(data[0]);

  return (
    <table className = "table table-success table-hover table-bordered table-responsive-md"> 
      <thead>
        <tr className="text-center">
          {headers.map((header, index) => (
            <th scope="col" key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr className="text-center" key={index}>
            {columns.map((column, index) => (
              column === "queue_id" ? <td key={index}>{count++}</td> : <td key={index}>{row[column]}</td>
              
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default InstructorTable;
