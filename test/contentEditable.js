var casper = require('casper').create();

casper.start('http://localhost:8080/plain.html', function() {
    this.echo(this.getTitle());

    this.mouseEvent('click', 'select#merge option:nth-child(2)');

    if (this.exists('#inputOneEditable')) {
        this.echo('there it is');

        this.mouseEvent('click', '#inputOne');
        this.sendKeys('#inputOne', 'Test String');
    }
});



casper.run();