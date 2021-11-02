class Network {
  constructor(layers, activation = x => x) {
    this.layers = layers;
    this.activation = activation;
  }
  forward(inputs) {
    let prev = inputs.map(a => [a]);
    for (let layer of this.layers) {
      const result = [];
      for (let i in layer) {
        result[i] = [];
        for (let j in prev[0]) {
          let sum = 0;
          for (let k in layer[0]) sum += layer[i][k] * prev[k][j];
          result[i][j] = this.activation(sum);
        }
      }
      prev = result;
    }
    return prev.flat();
  }
}