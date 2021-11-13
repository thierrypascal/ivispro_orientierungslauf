import Enumerable from '../lib/linq.js-4.0.0/linq.js'

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, the amount of entries per birthdate should be counted
    //TODO: for each year, the amount of individual participants per birthday should be counted
    const data = [];
    let dataOfParticipations = [];
    let xAxisLabel;
    let yAxisLabel;
    d3.csv('./data/alleTeilnehmer.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        function loadDataOfYear(year) {
            //get data for participations
            dataOfParticipations = Enumerable.from(data)
                .select(function (t) {
                    return {year: t.year, name: t.name, dob: t.dob};
                })
                .where(function (t) {
                    return t.year === year && t.dob !== "9999";
                })
                .groupBy(
                    function (t) {
                        return t.dob;
                    },
                    function (t) {
                        return {name: t.name};
                    },
                    function (key, grouping) {
                        return {dob: key, participations: grouping.count()};
                    }
                ).orderBy(function (t) {
                    return parseInt(t.dob.toString(), 10);
                })
                .toArray();

            console.log(dataOfParticipations);

            //init label
            xAxisLabel = 'Teilnehmer vom Jahr ' + year;
            yAxisLabel = 'Jahrgang';
        }

        //construct graph

        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 60},
            width = 800 - margin.left - margin.right,
            height = 1200 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;


        function update(d) {
            //clear svg bevor redrawing
            d3.selectAll("svg > *").remove();

            //append the svg object to the html body
            const svg = d3.select('#demografischeTeilnehmerzahl')
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + 20)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //set pixel range/scale
            let xScale = d3.scaleLinear().range([0, innerWidth]);
            let yScale = d3.scaleBand().range([innerHeight, 0]);

            const g = svg.append('g')
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            //create x, y-Axis
            const xAxis = d3.axisBottom(xScale)
                .ticks(10)
                .tickFormat(d3.format("d"))
                .tickPadding(15);

            const yAxis = d3.axisLeft(yScale)
                .tickPadding(10)
                .tickFormat(d3.format('d'))

            //set data range
            xScale.domain([0, 3500]);
            yScale.domain(d.map(d => d.dob)).padding(.1);

            //set x, y-Axis
            const yAxisG = g.append('g').call(yAxis);
            yAxisG.append('text')
                .attr('class', 'axis-label')
                .attr('y', -45)
                .attr('x', -innerHeight / 2)
                .attr('fill', 'black')
                .attr('transform', `rotate(-90)`)
                .attr('text-anchor', 'middle')
                .text(yAxisLabel);

            const xAxisG = g.append('g').call(xAxis)
                .attr('transform', `translate(0,${innerHeight})`);
            xAxisG.append('text')
                .attr('class', 'axis-label')
                .attr('y', 40)
                .attr('x', innerWidth / 2)
                .attr('fill', 'black')
                .text(xAxisLabel);

            //bind data to graph
            var u = svg.selectAll("rect").data(d);

            //create bars of participations
            u.enter()
                .append("rect")
                .merge(u)
                .transition()
                .duration(1000)
                .attr("x", xScale(0))
                .attr("y", function (d) {
                    return yScale(d.dob);
                })
                .attr("width", function (d) {
                    return xScale(d.participations);
                })
                .attr("height", yScale.bandwidth())
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 60 + ',' + 10 + ')')
                .attr("fill", "#004085");

            //TODO: remove second line as soon as update() call works
            //TODO: update axis range together with data
            //TODO: change color per dataset
        }

        const interval = window.setInterval(loadForEachYear, 4000);
        let year = 2008;

        function loadForEachYear() {
            if (year <= 2020) {
                loadDataOfYear(year.toString());
                update(dataOfParticipations);
                year += 1;
            } else {
                year = 2008;
            }
        }
    });
});