import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
);

function RatingChart({ history }) {

    const labels = history.map(item =>
        new Date(item.date.seconds * 1000).toLocaleDateString()
    );

    const data = {
        labels,
        datasets: [
            {
                label: "CF Rating",
                data: history.map(item => item.rating),
                fill: false,
                tension: 0.3
            }
        ]
    };

    return <Line data={data} />;
}

export default RatingChart;
