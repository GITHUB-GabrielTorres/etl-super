import { ResponsiveBoxPlot } from '@nivo/boxplot'

const datax = [
    {
        "group": "tarde",
        "value": 0.5544554455445545
    },
    {
        "group": "tarde",
        "value": 0.547945205479452
    },
    {
        "group": "tarde",
        "value": 0.525
    },
    {
        "group": "tarde",
        "value": 0.7222222222222222
    },
    {
        "group": "tarde",
        "value": 0.6794871794871795
    },
    {
        "group": "tarde",
        "value": 0.6875
    },
    {
        "group": "tarde",
        "value": 0.5495495495495496
    },
    {
        "group": "tarde",
        "value": 0.6212121212121212
    },
    {
        "group": "tarde",
        "value": 0.7375
    }
]



export default  function BoxPlotTest({ data /* see data tab */ }){
    return(
        <ResponsiveBoxPlot /* or BoxPlot for fixed dimensions */
            data={datax}
            margin={{ top: 60, right: 140, bottom: 60, left: 60 }}
            subGroupBy="subgroup"
            colorBy='group'
            axisBottom={{ legend: 'group', legendOffset: 32 }}
            axisLeft={{ legend: 'value', legendOffset: -40 }}
            borderRadius={2}
            medianColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            whiskerColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
            legends={[
                {
                    anchor: 'right',
                    direction: 'column',
                    translateX: 100,
                    itemWidth: 60,
                    itemHeight: 20,
                    itemsSpacing: 3
                }
            ]}
        />
    )
}