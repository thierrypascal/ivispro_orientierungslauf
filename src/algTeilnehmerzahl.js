document.addEventListener("DOMContentLoaded", function (event) {
    //set dimensions and margin of the graph
    const margin = {top: 10, right: 40, bottom: 20, left: 30},
        width = 650 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;


    //append the svg object to the html body
    const svg = d3.select('#algTeilnehmerzahl')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + 20)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //create data
    d3.csv('./data/alleTeilnehmer_shortTest.csv').then((teilnehmer) => {
        const data = [];
        const findByPropInObjectArray = (arr, prop) => match => arr.find(e => e[prop] === match);
        const findYear = findByPropInObjectArray(data, "year");
        for (let i = 0; i < teilnehmer.length; i++) {
            if (findYear(teilnehmer[i].year) !== undefined) {
                findYear(teilnehmer[i].year).value++;
            } else {
                let obj = {
                    'year': teilnehmer[i].year,
                    'value': 1,
                };
                data.push(obj);
            }
        }
        console.log(data);

        const xAxisLabel = 'Jahr';
        const yAxisLabel = 'Teilnehmer';

        // SET PIXEL RANGE OF AXIS----------------------
        let xScale = d3.scaleTime().range([0, innerWidth]);
        let yScale = d3.scaleLinear().range([innerHeight, 0]);
        // -------------------------------------

        // SET DATA RANGE OF AXIS ----------------------
        xScale.domain(d3.extent(teilnehmer, d => d.year)).nice();
        yScale.domain([0, 100000]).nice();
        // -------------------------------------

        const g = svg.append('g')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickSize(-innerHeight)
            .tickFormat(d3.format("d"))
            .tickPadding(15);

        const yAxis = d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickPadding(10)
            .tickFormat(d3.format('d'))

        const yAxisG = g.append('g').call(yAxis);
        yAxisG.selectAll('.domain').remove();

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

        xAxisG.select('.domain').remove();

        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', 40)
            .attr('x', innerWidth / 2)
            .attr('fill', 'black')
            .text(xAxisLabel);

        //bind data to graph
        //create line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return xScale(d.year) })
                .y(function(d) { return yScale(d.value) })
            )
            //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
            .attr('transform', 'translate(' + 30 + ',' + 10 + ')');

        //create dots
        svg.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d){ return xScale(d.year) })
            .attr("cy", function(d){ return yScale(d.value) })
            .attr("r", 4)
            //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
            .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
    });
});
