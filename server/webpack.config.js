const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackObfuscator = require('webpack-obfuscator');


module.exports = {
  // Set the mode to 'production' for optimization
  mode: 'production',

  // Entry point of your application
  entry: './src/index.ts', // Change this to your app's entry file

  // Output configuration
  output: {
    filename: 'index.js', // The bundled output file
    path: path.resolve(__dirname, 'dist'),
  },

  // Specify that this is a Node.js app
  target: 'node',

  // Exclude node_modules from the bundle
  externals: [nodeExternals()],

  // Handle TypeScript files
  module: {
    rules: [
      {
        test: /\.ts?$/, // Match .ts and .tsx files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new WebpackObfuscator({
      rotateStringArray: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
    }),
  ],
  // Resolve file extensions
  resolve: {
    extensions: ['.ts', '.js'],
  },
};


