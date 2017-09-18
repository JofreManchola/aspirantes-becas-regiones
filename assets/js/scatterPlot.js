console.clear();

var dataSet = "https://raw.githubusercontent.com/JofreManchola/aspirantes-becas-regiones/master/assets/data/ASPIRANTES_A_BECAS_DE_FORMACION%20(ASPIRANTES_A_BECAS_DE_FORMACION_DE_ALTO__NIVEL_PARA_LAS_REGIONES_2014_A_OCT_2016)_procesado.csv";

data = [];
dataScatterPlot = [];
x = {};
y = {};
colorScale10 = d3.scaleOrdinal(d3.schemeCategory10);
var r = 5

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
var fullWidth = 600,
    fullHeight = 500,
    margin = { top: 60, right: 20, bottom: 150, left: 100 },
    width = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;





makeScatterPlot = function (dx) {
    var svg = d3.select("#aspirante-depto-anho").append("svg")
        .attr("width", fullWidth)
        .attr("height", fullHeight)
        .attr("class", "svgScatterPlot")
        .append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    dx.sort(function (a, b) { return d3.descending(a.count, b.count); });

    x = d3.scaleBand()
        // .domain(dx.map(function (entry) {
        //     return entry['Departamento Oferta'];
        // }))
        .domain(getDepartamentos(dx))
        .rangeRound([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    y.domain([0, d3.max(dx, function (d) { return d.count; }) * 1.1]);

    // Add the scatterplot
    svg.selectAll("dot")
        .data(dx)
        .enter().append("circle")
        .attr("r", r)
        .attr("cx", function (d) { return x(d['Departamento Oferta']); })
        .attr("cy", function (d) { return y(d.count); })
        .style("fill", function (d, i) { return colorScale10(d['Ano Convo']); })
        .on("mousemove", onMouseover)
        .on("mouseout", onMouseout);

    // Add the X Axis
    svg.append("g")
        .attr("class", "gXaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-30,20) rotate(-90)")
        .attr("text-anchor", "end")
        .attr("class", "axis_label");

    // Add the Y Axis
    var yaxis = svg.append("g")
        .call(d3.axisLeft(y));
    yaxis.selectAll("text")
        .attr("class", "axis_label");
    yaxis.append("text")
        .text("Cantidad de aspirantes")
        .attr("transform", "translate(" + (-margin.left / 2) + "," + height / 2 + ") rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("class", "axis_title");

    //Creación del título de la gráfica
    svg.append("text")
        .attr("class", "chartTitle")
        .attr("transform", "translate(" + width / 2 + "," + (-margin.top / 2) + ")")
        .text("Aspirantes a ofertas departamentales por año")
        .attr("text-anchor", "middle");
    //.attr("y", heightScale2(heightScale2.ticks().pop()) + 0.5)

    makeLegend(svg, dx);
}

var tooltip = d3.select("body").append("div").attr("class", "toolTip");
var onMouseover = function (d) {
    tooltip
        .style("left", d3.event.pageX + 50 + "px")
        .style("top", d3.event.pageY - 50 + "px")
        .style("display", "inline-block")
        .html("<strong>Departamento:</strong> " + d['Departamento Oferta'] + "<br>" +
        "<strong>Año:</strong> " + d3.format(",d")(d['Ano Convo']) + "<br>" +
        "<strong>Cantidad de aspirantes:</strong> " + d3.format(",d")(d.count));
};

var onMouseout = function (d) {
    tooltip.style("display", "none"); // don't care about position!
};

var makeTooltip = function (d) {

}

var getAnhos = function (dx) {
    var anhos = [];
    dx.map(function (d) {
        if (!anhos.find(function (k) { return d['Ano Convo'] == k; })) {
            anhos.push(d['Ano Convo']);
        }
    })
    anhos.sort(function (a, b) { return d3.ascending(a, b); })
    return anhos;
}

var getDepartamentos = function (dx) {
    var departamentos = [];
    dx.map(function (d) {
        if (!departamentos.find(function (k) { return d['Departamento Oferta'] == k; })) {
            departamentos.push(d['Departamento Oferta']);
        }
    })
    // departamentos.sort(function (a, b) { return d3.ascending(a, b); })
    return departamentos;
}


var makeLegend = function (svg, dx) {
    // dx['Ano Convo']
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(getAnhos(dx).slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(-110," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", fullWidth - 20)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale10);

    legend.append("text")
        .attr("x", fullWidth - 25)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
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
