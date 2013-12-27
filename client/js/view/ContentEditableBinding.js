define(function () {
    var selectionId, selectionOffset;

    function updateEditable(domElem, textObservable, htmlObservable, homeCss, window, document) {
        if (domElem.textContent == textObservable()) {
//            selectionOffset = window.getSelection().anchorOffset;
            return false;
        }

        if (textObservable() != "" && domElem.textContent == "") {
            domElem.innerHTML = "";
            htmlObservable("");
            textObservable("");
            return false;
        }

        var selectedNode, anchorOffset, focusOffset, updateDom = false;

        var textNodes = [];
        for (var i = 0; i < domElem.children.length; i++)
            textNodes.push({css: domElem.children[i].classList[1], text: domElem.children[i].textContent});

        // if it's the 1st character help with init
        if (textNodes.length == 0 && domElem.textContent.trim().length > 0) {
            textNodes.push({css: homeCss, text: domElem.textContent.trim()});
            selectedNode = 0;
            anchorOffset = 1;
            focusOffset = 1;
            updateDom = true;

        } else if (domElem.textContent.length >= (textObservable() != null ? textObservable() : "").length) {

            var oldDomNodes = document.createElement("div");
            oldDomNodes.innerHTML = htmlObservable();

            var oldNodes = [];
            for (i = 0; i < oldDomNodes.children.length; i++)
                oldNodes.push({css: oldDomNodes.children[i].classList[1], text: oldDomNodes.children[i].textContent});

            if (oldNodes.length == 0 && textNodes.length == 1) {
                textNodes[0].css = homeCss;
                selectedNode = 0;
                anchorOffset = domElem.textContent.length;
                focusOffset = domElem.textContent.length;
                updateDom = true;
            } else {

                for (i = 0; i < textNodes.length; i++) {
                    var currTxtNode = textNodes[i];
                    if (currTxtNode.css != homeCss && currTxtNode.text.length >= oldNodes[i].text.length) {
                        for (var u = 0; u < currTxtNode.text.length; u++) {

                            if (currTxtNode.text[u] != oldNodes[i].text[u]) {

                                var newTxtNode = {css: homeCss, text: currTxtNode.text[u]};
                                var partOneOldTextNode = {css: currTxtNode.css, text: currTxtNode.text.substring(0, u)};
                                var partTwoOldTextNode = {css: currTxtNode.css, text: currTxtNode.text.substring(u + 1)};

                                if (partOneOldTextNode.text.length < 1 && partTwoOldTextNode.text.length > 0) {
                                    textNodes.splice(i, 1, newTxtNode, partTwoOldTextNode);
                                    selectedNode = i;
                                } else if (partTwoOldTextNode.text.length < 1 && partOneOldTextNode.text.length > 0) {
                                    textNodes.splice(i, 1, partOneOldTextNode, newTxtNode);
                                    selectedNode = i + 1;
                                } else {
                                    textNodes.splice(i, 1, partOneOldTextNode, newTxtNode, partTwoOldTextNode);
                                    selectedNode = i + 1;
                                }
                                anchorOffset = newTxtNode.text.length;
                                focusOffset = newTxtNode.text.length;

                                updateDom = true;
                                break;
                            }
                        }
                        if (updateDom)
                            break;
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

            domElem.innerHTML = newInnerHtml;

            if (domElem.children[selectedNode]) {
                window.getSelection().removeAllRanges();
                var range = document.createRange();

                range.setStart(domElem.children[selectedNode].firstChild, anchorOffset);
                range.setEnd(domElem.children[selectedNode].firstChild, focusOffset);
                window.getSelection().addRange(range);
                selectionId = selectedNode;
                selectionOffset = anchorOffset;
            }
        } else {
            selectionOffset = window.getSelection().focusOffset;
        }

        textObservable(domElem.textContent);
        htmlObservable(domElem.innerHTML);

        return true;
    }

    function getContentEditableBinding(brain, subscriptionManager) {
        return {
            init: function (element, valueAccessor) {

                var isUserUpdate = false;
                var isRemoteUpdate = false;

                element.addEventListener('keydown', function (event) {
                    setTimeout(function () {
                        var textObservable = valueAccessor().text;
                        var htmlObservable = valueAccessor().html;
                        isUserUpdate = true;
                        var ret = updateEditable(event.target, textObservable, htmlObservable, brain.cssClass, window, document);
                        if (ret)
                            subscriptionManager.handleContentEditable(event.target.id, textObservable(), htmlObservable());
                        isUserUpdate = false;
                    }, 0);

                });


                valueAccessor().html.subscribe(function () {
                    if (!isUserUpdate && !isRemoteUpdate) {
                        isRemoteUpdate = true;
                        console.log("change focus maybe");

                        element.innerHTML = valueAccessor().html();

                        isRemoteUpdate = false;
                    }
                });

                function oldSubscribe() {

                    if (!isUserUpdate && !isRemoteUpdate) {
                        isRemoteUpdate = true;

                        var textObservable = valueAccessor().text;
                        var htmlObservable = valueAccessor().html;
                        var domElem = element;
                        var homeCss = CssConstant.REMOTE_CSS;

                        if (textObservable() == "" && htmlObservable() != "") {
                            domElem.innerHTML = "";
                            htmlObservable("");
                            isRemoteUpdate = false;
                            return;
                        }

                        var textNodes = [];
                        for (var i = 0; i < domElem.children.length; i++)
                            textNodes.push({css: domElem.children[i].classList[1], text: domElem.children[i].textContent});

                        // var simplePushChange = false;
                        var pureText = valueAccessor().text();

                        if (textNodes.length == 0 && pureText.length > 0) {
                            textNodes.push({css: homeCss, text: pureText});

                        } else {

                            var lowerIndex = 0;
                            for (i = 0; i < textNodes.length; i++) {
                                var currElem = textNodes[i];
                                var stringToCompare = pureText.substring(0, currElem.text.length);
                                if (stringToCompare == currElem.text) {
                                    pureText = pureText.substring(currElem.text.length);
                                } else {
                                    lowerIndex = i;
                                    var charsToRemove = 0;
                                    for (var u = textNodes.length - 1; u > lowerIndex; u--) {
                                        charsToRemove += textNodes[u].text.length;
                                    }
                                    var nodeTextToCompare = pureText.substring(0, pureText.length - charsToRemove);

                                    if (currElem.css == homeCss) {
                                        currElem.text = nodeTextToCompare;
                                    } else {
                                        if (currElem.text.length <= nodeTextToCompare.length) {
                                            //split node
                                            for (var v = 0; v < currElem.text.length; v++) {

                                                if (currElem.text[v] != nodeTextToCompare[v] || (nodeTextToCompare[v] == nodeTextToCompare[v + 1] && currElem.text[v + 1] != nodeTextToCompare[v + 1])) {

                                                    var newTxtNode = {css: homeCss, text: nodeTextToCompare[v]};
                                                    var partOneOldTextNode = {css: currElem.css, text: nodeTextToCompare.substring(0, v)};
                                                    var partTwoOldTextNode = {css: currElem.css, text: nodeTextToCompare.substring(v + 1)};

                                                    if (partOneOldTextNode.text.length < 1 && partTwoOldTextNode.text.length > 0) {
                                                        textNodes.splice(i, 1, newTxtNode, partTwoOldTextNode);
                                                    } else if (partTwoOldTextNode.text.length < 1 && partOneOldTextNode.text.length > 0) {
                                                        textNodes.splice(i, 1, partOneOldTextNode, newTxtNode);
                                                    } else {
                                                        textNodes.splice(i, 1, partOneOldTextNode, newTxtNode, partTwoOldTextNode);
                                                    }

                                                    break;
                                                }
                                            }

                                        } else {
                                            currElem.text = nodeTextToCompare;
                                        }
                                    }

                                    break;
                                }
                                if (textNodes.length - 1 == i) {
                                    // simplePushChange = true;
                                    textNodes.push({css: CssConstant.REMOTE_CSS, text: pureText});
                                    break;
                                }
                            }
                        }

                        // remove empty nodes and concatenate nodes with same css class
                        var lastCss = "initial nothing";

                        for (var a = 0; a < textNodes.length; a++) {
                            if (textNodes[a].text.length < 1) {
                                deleteNode(a); //todo textNodes == undefined
                                break;
                            } else {
                                if (lastCss == textNodes[a].css) {
//                                    var possibleFocus = textNodes[a - 1].text.length;
//                                    textNodes[a - 1].text += textNodes[a].text;
                                    deleteNode(a);
                                    break;
                                }

                                lastCss = textNodes[a].css;
                            }

                            function deleteNode(index) {
                                textNodes.splice(index, 1);
//                                a--;
                            }
                        }

                        var updateSelection = false;
                        if (document.activeElement.id == "inputOneEditable") {
                            updateSelection = true;
                        }

                        var newInnerHtml = "";
                        textNodes.forEach(function (txtN) {
                            newInnerHtml += '<span class="label ' + txtN.css + '">' + txtN.text + '</span>';
                        });

                        domElem.innerHTML = newInnerHtml;

                        if (updateSelection) {
//                            console.log(window.getSelection());
//                            console.log(window.getSelection().focusNode);
//                            console.log(window.getSelection().focusNode.parentNode);

//                            var index = 0;
//                            (function calcIndex(node) {
//                                if (node.previousSibling != null) {
//                                    index++;
//
//                                    console.log(node.previousSibling);

//                                    calcIndex(node.previousSibling);
//                                }
//                            })(window.getSelection().focusNode.parentNode);

//                            var offSet = window.getSelection().focusOffset;

                            if (domElem.children[selectionId]) {
                                window.getSelection().removeAllRanges();

                                var range = document.createRange();

                                console.log("id: " + selectionId);
                                console.log("id length: " + textNodes[selectionId].text.length);
                                console.log(textNodes);
                                console.log("offset " + selectionOffset);

                                range.setStart(domElem.children[selectionId].firstChild, selectionOffset);
                                //todo index irgendwas outofbound oder so
                                range.setEnd(domElem.children[selectionId].firstChild, selectionOffset);
                                window.getSelection().addRange(range);
                            }
                            //todo verliere index wenn anderer schreibt und ich cursor verwende

                            //todo umschreiben, sodass nur eigener client sagt wo etwas dazukommt
                            // und dann in json die mehrinformation mitschickt
                        }

                        textObservable(domElem.textContent);
                        htmlObservable(domElem.innerHTML);

                        isRemoteUpdate = false;
                    }
                }

            }
//        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
// todo: file knockout issue, because update function only gets fired once or twice (maybe because of 2 observables??),
// after content editable div is in use update doesn't get fired anymore
// -> update fn is a subscription fn on an observable in init
//        }
        };
    }

    return getContentEditableBinding;
});