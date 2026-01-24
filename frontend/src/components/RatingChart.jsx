import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function RatingChart({ history }) {

    const data = history.map((item, index) => ({
        name: index + 1,
        rating: item.rating
    }));

    return (
        <div>
            <h2 className="text-white text-lg font-semibold mb-4">
                Rating Progress
            </h2>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid stroke="rgba(255,255,255,0.1)" />

                    <XAxis dataKey="name" stroke="white" />
                    <YAxis stroke="white" />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: "#ec4899", r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default RatingChart;
