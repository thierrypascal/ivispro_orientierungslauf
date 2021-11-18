import Enumerable from '../lib/linq.js-4.0.0/linq.js'

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, each participant should have a line showing the amount of participations per year
    const data = [];
    const dataOfParticipants = [];
    d3.csv('./data/alleTeilnehmer.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        //get data for participations
        //TODO
        //Welche Datenstruktur wird benötigt?
        //[[name [{year: 2008, p: y}, {year: 2009, p: y}, ...]], ...]
        dataOfParticipants.push(Enumerable.from(data)
            .select(function (t) {
                return {name: t.name, year: t.year, dob: t.dob};
            })
            .orderBy(function (t) {
                return parseInt(t.dob.toString(), 10);
            })
            //TODO: verschachtelte Abfrage mit Select(new) um gewünschte Struktur zu erstellen
            .groupBy(
                function (t) {
                    return t.name;
                },
                function (t) {
                    return {name: t.name};
                },
                function (key, grouping) {
                    return {name: key, p: grouping.count()};
                }
            )
            .toArray());

        console.log(dataOfParticipants);

        //construct graph
        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 30},
            width = 650 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;

        //append the svg object to the html body
        const svg = d3.select('#teilnahmenProPersonLinie')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + 20)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //init label
        const xAxisLabel = 'Jahr';
        const yAxisLabelLeft = 'Person, Jahrgang abnehmend';
        const yAxisLabelRight = 'Anzahl Teilnahmen';

        //set pixel range/scale
        let xScale = d3.scaleTime().range([0, innerWidth]);
        let yScaleLeft = d3.scaleLinear().range([innerHeight, 0]);
        let yScaleRight = d3.scaleLinear().range([innerHeight, 0]);

        const g = svg.append('g')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        //create x, y-Axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickSize(-innerHeight)
            .tickFormat(d3.format("d"))
            .tickPadding(15);

        const yAxis = d3.axisRight(yScaleRight)
            .tickSize(-innerWidth)
            .tickPadding(10)
            .tickFormat(d3.format('d'))

        //set data range
        xScale.domain([2008, 2020]);
        yScaleRight.domain(d3.extent(dataOfParticipants, t => t.p)).nice();

        //set x, y-Axis
        const yAxisG = g.append('g').call(yAxis);
        //add label
        yAxisG.selectAll('.domain').remove();
        yAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', -45)
            .attr('x', -innerHeight / 2)
            .attr('fill', 'black')
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(yAxisLabelRight);

        const xAxisG = g.append('g').call(xAxis)
            .attr('transform', `translate(0,${innerHeight})`);
        //add label
        xAxisG.select('.domain').remove();
        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', 40)
            .attr('x', innerWidth / 2)
            .attr('fill', 'black')
            .text(xAxisLabel);

        //bind data to graph
        //create line of participations
        svg.append("path").datum(dataOfParticipants)
            .attr("fill", "none")
            .attr("stroke", "#5091ff")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
                .curve(d3.curveBasis)
                .x(d => xScale(d.year))
                .y(d => yScaleRight(d.p))
            )
            //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
            .attr('transform', 'translate(' + 30 + ',' + 10 + ')');

    });
});