const fs = require('fs')
const { execSync } = require('child_process')

const options = {
  stdio: 'inherit'
}
const linkPackage = ['react', 'react-dom', '@midwayjs/decorator', '@midwayjs/web', 'vue', 'vuex', 'vue-router']

if (process.argv.includes('--bootstrap')) {
  let shell = 'npx concurrently "yarn"'
  const examples = fs.readdirSync('./example')
  examples.forEach(example => {
    if (example !== '.DS_Store') {
      shell += ` "cd example/${example} && yarn" `
    }
  })
  execSync(shell, options)
  execSync('yarn build:only', options)
}
if (process.argv.includes('--clean')) {
  const shell = 'rm -rf node_modules yarn.lock **/**/cjs **/**/esm **/**/node_modules **/**/yarn.lock **/**/package-lock.json'
  execSync(shell, options)
}
if (process.argv.includes('--link')) {
  const packages = fs.readdirSync('./packages')
  let shell = 'npx concurrently'
  linkPackage.forEach(item => {
    shell += ` "cd node_modules/${item} && yarn link" ` // link react-dom 防止出现多个react实例
  })

  packages.forEach(item => {
    if (item !== '.DS_Store') {
      shell += ` "cd packages/${item} && yarn link" ` // 在 example 中 link packages 下面所有的包
    }
  })
  const linkedPackage = packages.filter(item => item !== '.DS_Store').map(item => item === 'cli' ? 'ssr' : 'ssr-' + item)
    .concat(linkPackage).join(' ')
  const examples = fs.readdirSync('./example')
  examples.forEach(example => {
    if (example !== '.DS_Store') {
      const exampleShell = shell + `&& cd example/${example} && yarn link ${linkedPackage} && chmod 777 ./node_modules/ssr/cjs/cli.js`
      execSync(exampleShell, options)
    }
  })
}
if (process.argv.includes('--unlink')) {
  const packages = fs.readdirSync('./packages')
  let shell = 'npx concurrently'
  linkPackage.forEach(item => {
    shell += ` "cd node_modules/${item} && yarn unlink" ` // link react-dom 防止出现多个react实例
  })
  packages.forEach(item => {
    if (item !== '.DS_Store') {
      shell += ` "cd packages/${item} && yarn unlink" `
    }
  })
  execSync(shell, options)
}
