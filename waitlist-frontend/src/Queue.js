import React from 'react';

function Queue({ headers, data }) {
let count = 1;
return (
  <table className="table table-success table-hover table-bordered table-responsive-md">
    <thead>
      <tr className="text-center">
        {headers.map((header, index) => (
          <th scope="col" key={index}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
        {data.map(({ queue_id, ...row }, index) => (
          <tr className="text-center" key={index}>
            <td>{count++}</td>
            {Object.values(row).map((value, index) => (
              <td key={index}>{value}</td>
            ))}
          </tr>
        ))}
    </tbody>
  </table>
);
}

export default Queue;
