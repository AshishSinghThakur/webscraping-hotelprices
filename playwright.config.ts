const browserEnv = process.env.BROWSER; 

const browser = browserEnv ? browserEnv.toUpperCase() : 'chrome';

const config = {
  testDir: 'src',
  testMatch: '**/*.test.ts',
  timeout: 180000,
  workers: 1,
  use: {
    actionTimeout: 180000,
    navigationTimeout: 180000,
    launchOptions: {
        args: ["--start-maximized"],
      },
  },
}

export default config