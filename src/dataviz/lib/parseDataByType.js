function DataTypeParser() {}

DataTypeParser.metric = function(response) {
  var dataType, schema, dataset;
  dataType = 'singular';
  schema = {
    records: '',
    select: [{
      path: 'result',
      type: 'string',
      label: 'Metric'
    }]
  };
  return dataType, schema, dataset;
}

DataTypeParser.selectUnique = function(response) {
  var dataType, schema, dataset;
  dataType = 'nominal';
  dataset = new Dataset();
  dataset.appendColumn('unique values', []);
  each(response.result, function(result, i){
    dataset.appendRow(result);
  });
  return dataType, schema, dataset;
}

DataTypeParser.singleValueInterval = function(response, indexTarget) {
  var dataType, schema, dataset;
  dataType = 'chronological';
  schema = {
    records: 'result',
    select: [
    {
      path: indexTarget,
      type: 'date'
    },
    {
      path: 'value',
      type: 'number'
        // format: '10'
    }
    ]
  }
  return dataType, schema, dataset;
}

DataTypeParser.staticGroupBy = function(response) {
  var dataType, schema, dataset;
  dataType = 'categorical';
  schema = {
    records: 'result',
    select: []
  };
  for (var key in response.result[0]){
    if (response.result[0].hasOwnProperty(key) && key !== 'result'){
      schema.select.push({
        path: key,
        type: 'string'
      });
      break;
    }
  }
  schema.select.push({
    path: 'result',
    type: 'number'
  });
  return dataType, schema, dataset;
}
