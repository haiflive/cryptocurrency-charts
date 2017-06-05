import { ChartWebPage } from './app.po';

describe('chart-web App', () => {
  let page: ChartWebPage;

  beforeEach(() => {
    page = new ChartWebPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
