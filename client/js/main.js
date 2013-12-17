require(['lib/knockout', 'Connector', 'Brain', 'History', 'Messenger', 'constants/MergeConstant',
    'constants/HistoryConstant', 'constants/NotificationConstant', 'view/ConfigViewModel', 'view/DynamicViewModel',
    'utils/getValues', 'utils/parseUrlParams', 'UrlJuggler', 'utils/generateId', 'constants/InputConstant', 'App',
    'ConnectionManager', 'HistoryManager', 'SubscriptionManager',
    'lib/domReady'], function (ko, Connector, Brain, History, Messenger, MergeConstant, HistoryConstant, NotificationConstant, ConfigViewModel, DynamicViewModel, getValues, parseUrlParams, UrlJuggler, generateId, InputConstant, App, ConnectionManager, HistoryManager, SubscriptionManager) {

    var URL = location.origin;
    var LOCAL_CSS = "label-info";
    var REMOTE_CSS = "label-warning";

    var connector = new Connector();
    var brain = new Brain();
    var history = new History();
    var messenger = new Messenger();
    var urlJuggler = new UrlJuggler(location.pathname, window.history.pushState.bind(window.history));
    var urlParams = parseUrlParams(location.search);


    var mergeParam = urlParams['merge'];
    var mergeStrategy = mergeParam !== undefined ? mergeParam : MergeConstant.PLAIN;
    var historyParam = urlParams['history'];
    var historyStrategy = historyParam !== undefined ? historyParam : HistoryConstant.BY_TIME;
    var notifyParam = urlParams['notification'];
    var notificationStrategy = notifyParam !== undefined ? notifyParam : NotificationConstant.BUBBLE;

    var configView = new ConfigViewModel(getValues(MergeConstant), getValues(HistoryConstant),
        getValues(NotificationConstant),
        mergeStrategy, historyStrategy, notificationStrategy, urlParams['user']);

    var userName = urlParams['user'];

    if (userName !== undefined) {
        brain.userId = userName;
    }

    var inputIds = [];
    var inputs = document.querySelectorAll('input[id*=' + InputConstant.PREFIX + ']');
    for (var i = 0; i < inputs.length; i++) {
        inputIds.push(inputs[i].id);
    }

    var view = new DynamicViewModel(inputIds, history, configView.history(), configView.merge());

    var isUserUpdate = false;
    ko.bindingHandlers.contentEditable = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var textObservable = valueAccessor().text;
            var htmlObservable = valueAccessor().html;

            element.addEventListener('keyup', function (event) {
                if (event.target.textContent == textObservable()) //todo check if even useful
                    return;

                var selection = window.getSelection();
                var anchorOffset = selection.anchorOffset;
                var focusOffset = selection.focusOffset;
                var selectedNode = 0;
                var updateDom = true;
                var u, i;

                var children = event.target.children;
                var textNodes = [];
                var node;
                for (i = 0; i < children.length; i++) {
                    node = children[i];
                    textNodes.push({css: node.classList[1], text: node.textContent});
                }

                // if it's the 1st character help with init
                if (textNodes.length == 0 && event.target.textContent.length > 0)
                    textNodes.push({css: LOCAL_CSS, text: event.target.textContent});

                var oldTextTotal = textObservable() != null ? textObservable() : "";
                var oldHtml = htmlObservable() != null ? htmlObservable() : "";

                console.log("old: " + textObservable());
                console.log("new: " + event.target.textContent);

                // user added >0 characters -> longer
                if (event.target.textContent.length > oldTextTotal.length) {
                    var diffCount = event.target.textContent.length - oldTextTotal.length;
                    var textOffset = 0;
                    var diffFound = 0;

                    for (i = 0; i < textNodes.length; i++) {
                        var txtNode = textNodes[i];

                        var newNodeStartIndex;
                        var newNodeEndIndex;
                        var newTxtNode;
                        var partOneOldTextNode;
                        var partTwoOldTextNode;
                        var creatingNewTxtNode = false;

                        for (u = 0; u < txtNode.text.length; u++) {

                            // txtNode (longer) will hopefully have the new character, textObservable has the old shorter text
                            if (txtNode.text[u] != oldTextTotal[u + textOffset - diffFound]) {

                                // case luckily the right css
                                if (txtNode.css == LOCAL_CSS) {
                                    diffCount--;
                                    diffFound++;
                                    selectedNode = i;
                                    if (diffCount < 1)
                                        break;
                                }
                                // case have to introduce new span
                                else {
                                    if (newTxtNode == null) {
                                        // create initial temp node
                                        newTxtNode = {css: LOCAL_CSS, text: txtNode.text[u]};
                                        creatingNewTxtNode = true;
                                        newNodeStartIndex = u;
                                    } else {
                                        // add next character to temp node buffer
                                        newTxtNode.text += txtNode.text[u];
                                    }


                                    diffCount--;
                                    diffFound++;
                                    if (diffCount < 1) {
                                        insertNewTextNode(1);
                                        break;
                                    }
                                }
                            } else {
                                insertNewTextNode(0)
                            }
                        }
                        textOffset += txtNode.text.length;

                        if (diffCount < 1)
                            break;
                    }

                }
                // user removed >0 characters -> shorter
                else if (event.target.textContent.length < oldTextTotal.length) {
                    updateDom = false;
                }
                // user changed >0 characters -> same length
                else if (event.target.textContent.length == oldTextTotal.length) {
                    updateDom = false;
                    var oldDomNodes = document.createElement("div");
                    oldDomNodes.innerHTML = htmlObservable();
                    var oldNodes = [];
                    for (i = 0; i < oldDomNodes.children.length; i++)
                        oldNodes.push({css: oldDomNodes.children[i].classList[1], text: oldDomNodes.children[i].textContent});

                    var textNodesOffset = 0;
                    for (i = 0; i < textNodes.length; i++) {
                        var currTxtNode = textNodes[i];
                        if (currTxtNode.css != LOCAL_CSS) {
                            for (u = 0; u < currTxtNode.text.length; u++) {

                                if (currTxtNode.text[u] != oldNodes[i - textNodesOffset].text[u]) {

                                    newTxtNode = {css: LOCAL_CSS, text: currTxtNode.text[u]};
                                    partOneOldTextNode = {css: currTxtNode.css, text: currTxtNode.text.substring(0, u)};
                                    partTwoOldTextNode = {css: currTxtNode.css, text: currTxtNode.text.substring(u + 1)};

                                    if (partOneOldTextNode.text.length < 1 && partTwoOldTextNode.text.length > 0) {
                                        textNodes.splice(i, 1, newTxtNode, partTwoOldTextNode);
                                        selectedNode = i;
                                        textNodesOffset++;
                                        i++;
                                    } else if (partTwoOldTextNode.text.length < 1 && partOneOldTextNode.text.length > 0) {
                                        textNodes.splice(i, 1, partOneOldTextNode, newTxtNode);
                                        selectedNode = i + 1;
                                        textNodesOffset++;
                                        i++;
                                    } else {
                                        textNodes.splice(i, 1, partOneOldTextNode, newTxtNode, partTwoOldTextNode);
                                        selectedNode = i + 1;
                                        textNodesOffset += 2;
                                        i += 2;
                                    }
                                    anchorOffset = newTxtNode.text.length;
                                    focusOffset = newTxtNode.text.length;

                                    updateDom = true;
                                }
                            }
                        }
                    }
                }

                // remove empty nodes and concatenate nodes with same css class
                var lastCss = "initial nothing";

                for (var a = 0; a < textNodes.length; a++) {
                    if (textNodes[a].text.length < 1) {
                        deleteNode(textNodes[a - 1].text.length);
                    } else {
                        if (lastCss == textNodes[a].css) {
                            var possibleFocus = textNodes[a - 1].text.length;
                            textNodes[a - 1].text += textNodes[a].text;
                            deleteNode(possibleFocus);
                        }

                        lastCss = textNodes[a].css;
                    }

                    function deleteNode(possibleFocus) {
                        textNodes.splice(a, 1);
                        selectedNode = a - 1;
                        anchorOffset = possibleFocus;
                        focusOffset = possibleFocus;
                        a--;
                        updateDom = true;
                    }
                }

                if (updateDom) {
                    var newInnerHtml = "";
                    textNodes.forEach(function (txtN) {
                        newInnerHtml += '<span class="label ' + txtN.css + '">' + txtN.text + '</span>';
                    });

                    event.target.innerHTML = newInnerHtml;

                    if (event.target.children[selectedNode]) {
                        selection.removeAllRanges();
                        var range = document.createRange();

                        range.setStart(event.target.children[selectedNode].firstChild, anchorOffset);
                        range.setEnd(event.target.children[selectedNode].firstChild, focusOffset);
                        selection.addRange(range);
                    }
                }

                isUserUpdate = true;

                textObservable(event.target.textContent);
                console.log("txt observable: " + textObservable());

                htmlObservable(event.target.innerHTML);
                console.log("html observable: " + htmlObservable());

                function insertNewTextNode(indexOffset) {
                    if (creatingNewTxtNode) {
                        creatingNewTxtNode = false;
                        newNodeEndIndex = u + indexOffset;

                        partOneOldTextNode = {css: txtNode.css, text: txtNode.text.substring(0, newNodeStartIndex)};
                        partTwoOldTextNode = {css: txtNode.css, text: txtNode.text.substring(newNodeEndIndex)};

                        if (partOneOldTextNode.text.length < 1 && partTwoOldTextNode.text.length > 0) {
                            textNodes.splice(i, 1, newTxtNode, partTwoOldTextNode);
                        } else if (partTwoOldTextNode.text.length < 1 && partOneOldTextNode.text.length > 0) {
                            textNodes.splice(i, 1, partOneOldTextNode, newTxtNode);
                        } else if (partOneOldTextNode.text.length < 1 && partTwoOldTextNode.text.length < 1) {
                            textNodes.splice(i, 1, newTxtNode);
                        } else {
                            textNodes.splice(i, 1, partOneOldTextNode, newTxtNode, partTwoOldTextNode);
                        }

                        i++;
                        selectedNode = i;
                        if (newTxtNode.text.length > 1) {
                            anchorOffset = newTxtNode.text.length;
                            focusOffset = newTxtNode.text.length;
                        } else {
                            anchorOffset = 1;
                            focusOffset = 1;
                        }

                        newTxtNode = null;
                    }
                }
            });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            if (isUserUpdate) {
                isUserUpdate = false;
                return;
            }
            // get diff between textObservable &  element.textContent -> this is written by another user
            // wrap this with custom span
            // -> set htmlObservable & element.innerHTML with new findings
            var textObservable = valueAccessor().text;
            var htmlObservable = valueAccessor().html;

            htmlObservable(textObservable() != null ? '<span class="label label-warning">' + textObservable() + '</span>' : "");

            element.innerHTML = htmlObservable();
        }
    };

    function transformToHTML(plainText, htmlText) {
        return null;
    }

    ko.applyBindings(configView, document.getElementById('config'));
    ko.applyBindings(view, document.getElementById('mainView'));

    var historyManager = new HistoryManager(history, view);
    var subscriptionManager = new SubscriptionManager(view, configView, connector, brain, urlJuggler, urlParams,
        generateId, history, historyManager);
    var connectionManager = new ConnectionManager(view, configView, brain, historyManager, history);

    var app = new App(view, configView, connector, subscriptionManager, connectionManager);
    app.setUpInputSubscriptions(inputs);
    app.setUpConnection(URL);

    //todo nxt steps:
    //dann multi merge
    //dann notifications

});