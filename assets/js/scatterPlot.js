console.clear();

var dataSet = "https://raw.githubusercontent.com/JofreManchola/aspirantes-becas-regiones/master/assets/data/ASPIRANTES_A_BECAS_DE_FORMACION%20(ASPIRANTES_A_BECAS_DE_FORMACION_DE_ALTO__NIVEL_PARA_LAS_REGIONES_2014_A_OCT_2016)_procesado.csv";

data = [];
dataScatterPlot = [];
x = {};
y = {};

var dataDom = d3.select("#dataDom");
var getData = function (d) { return d; }
var summarizeScatterPlot = function (dd) {
    var temp = d3.nest()
        .key(function (d) { return d.keyScatterPlot; })
        .rollup(function (d) {
            var t1 = d3.sum(d, function (g) { return 1; });
            var t2 = d[0]['Ano Convo'];
            var t3 = d[0]['Departamento Oferta'];
            return { 'count': t1, 'Ano Convo': t2, 'Departamento Oferta': t3 }
        }).entries(dd);

    return temp.map(function (datum, index, arr) {
        return datum.value;
    });
}

// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 100, left: 50 },
    fullWidth = 400,
    fullHeight = 400,
    width = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#aspirante-depto-anho").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");




makeScatterPlot = function (dx) {

    // set the ranges
    x = d3.scaleBand()
        .domain(dx.map(function (entry) {
            return entry['Departamento Oferta'];
        }))
        .rangeRound([0, height])
        .padding(0.1);
    y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .x(function (d) { return x(d['Departamento Oferta']); })
        .y(function (d) { return y(d.count); });

    var xDomain = dataScatterPlot.reduce(function (valorAnterior, valorActual, indice, vector) {
        // console.log("valorAnterior", valorAnterior);
        // console.log("valorActual", valorActual['Departamento Oferta']);
        valorAnterior.push(valorActual['Departamento Oferta']);
        return valorAnterior;
    }, [])

    // Scale the range of the data
    x.domain(xDomain);
    // x.domain(d3.extent(dx, function (d) { return d['Departamento Oferta']; }));
    y.domain([0, d3.max(dx, function (d) { return d.count; })]);

    // // Add the valueline path.
    // svg.append("path")
    //     .data([dx])
    //     .attr("class", "line")
    //     .attr("d", valueline);

    // Add the scatterplot
    svg.selectAll("dot")
        .data(dx)
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function (d) { return x(d['Departamento Oferta']); })
        .attr("cy", function (d) { return y(d.count); });

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}





d3.tsv(dataSet,
    // Row
    function row(d) {
        // console.log("d", d);
        d.keyScatterPlot = d['Ano Convo'] + d['Departamento Oferta'];
        return d;
    },
    //callback
    function (error, csv_data) {
        if (error) throw error;
        // console.log("csv_data", csv_data);
        data = getData(csv_data);
        dataScatterPlot = summarizeScatterPlot(csv_data);

        console.log("data-B", data);
        console.log("dataScatterPlot", dataScatterPlot);
        makeScatterPlot(dataScatterPlot);
        console.log("finish...");

    });
