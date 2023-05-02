import "/app/src/App.css";

//Functional version
function StudentWaitlist({ headers, data }) {
    //Queue settings
    if (!data.length) {
        return <div>No data to display</div>;
    }

    //Table setup params
    let count = 1;
    const columns = Object.keys(data[0]);

    return (
        <div>
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
                    {data.map((row, index) => (
                        <tr className="text-center" key={index}>
                            {columns.map((column, index) =>
                                column === "queue_id" ? (
                                    <td key={index}>{count++}</td>
                                ) : (
                                    <td key={index}>{row[column]}</td>
                                )
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default StudentWaitlist;
