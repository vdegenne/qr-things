import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
// import cjs from '@rollup/plugin-commonjs'
// import {terser} from 'rollup-plugin-terser'

export default {
  input: 'src/qr-things.ts',
  output: { file: 'public/qr-things.js', format: 'esm' },
  plugins: [
    typescript(),
    nodeResolve(),
    // terser()
  ]
}