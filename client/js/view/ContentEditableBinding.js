define(function () {
    var selectionId, selectionOffset;

    function updateEditable(domElem, textObservable, htmlObservable, homeCss, window, document) {
        if (domElem.textContent == textObservable()) {
            if (window.getSelection().anchorOffset == selectionOffset + 1) {
                selectionOffset = window.getSelection().anchorOffset;

            } else if (window.getSelection().anchorOffset >= selectionOffset + 2) {
                selectionOffset = window.getSelection().anchorOffset;
                selectionId--;

            } else if (window.getSelection().anchorOffset == selectionOffset - 1) {
                selectionOffset = window.getSelection().anchorOffset;

            } else if (window.getSelection().anchorOffset <= selectionOffset + 2) {
                selectionOffset = window.getSelection().anchorOffset;
                selectionId++;
            }

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

                        var isElementSelected = window.getSelection().containsNode(element, true);
                        var oldNodes = [], i;
                        if (isElementSelected) {
                            for (i = 0; i < element.children.length; i++)
                                oldNodes.push({css: element.children[i].classList[1], text: element.children[i].textContent});
                        }

                        // update the DOM
                        element.innerHTML = valueAccessor().html();

                        if (isElementSelected) {
                            var newNodes = [];
                            for (i = 0; i < element.children.length; i++)
                                newNodes.push({css: element.children[i].classList[1], text: element.children[i].textContent});

                            window.getSelection().removeAllRanges();
                            var range = document.createRange();

                            if (oldNodes.length == newNodes.length) {
                                if (selectionOffset > newNodes[selectionId].text.length) {
                                    range.setStart(element.children[selectionId].firstChild, newNodes[selectionId].text.length);
                                    range.setEnd(element.children[selectionId].firstChild, newNodes[selectionId].text.length);

                                } else {
                                    range.setStart(element.children[selectionId].firstChild, selectionOffset);
                                    range.setEnd(element.children[selectionId].firstChild, selectionOffset);
                                }

                            } else if (oldNodes.length < newNodes.length) {
                                var addedNode = -1;
                                for (i = 0; i < oldNodes.length; i++) {
                                    if (oldNodes[i].text.length != newNodes[i].text.length) {
                                        addedNode = i;
                                        break;
                                    }
                                }
                                if (addedNode == -1) {
                                    addedNode = newNodes.length - 1;
                                }

                                if (addedNode < selectionId) {
                                    range.setStart(element.children[selectionId + 2].firstChild, selectionOffset);
                                    range.setEnd(element.children[selectionId + 2].firstChild, selectionOffset);

                                } else if (addedNode == selectionId) {

                                    if (selectionOffset > newNodes[addedNode].text.length) {
                                        range.setStart(element.children[selectionId + 2].firstChild, selectionOffset - newNodes[addedNode].text.length);
                                        range.setEnd(element.children[selectionId + 2].firstChild, selectionOffset - newNodes[addedNode].text.length);
                                    } else {
                                        range.setStart(element.children[selectionId].firstChild, selectionOffset);
                                        range.setEnd(element.children[selectionId].firstChild, selectionOffset);
                                    }

                                } else if (addedNode > selectionId) {
                                    range.setStart(element.children[selectionId].firstChild, selectionOffset);
                                    range.setEnd(element.children[selectionId].firstChild, selectionOffset);
                                }

                            } else if (oldNodes.length > newNodes.length) {
                                var deletedNode = -1;
                                for (i = 0; i < newNodes.length; i++) {
                                    if (newNodes[i].text.length != oldNodes[i].text.length) {
                                        deletedNode = i;
                                        break;
                                    }
                                }
                                if (deletedNode == -1) {
                                    deletedNode = oldNodes.length - 1;
                                }

                                if (deletedNode < selectionId) {
                                    range.setStart(element.children[selectionId - 1].firstChild, selectionOffset);
                                    range.setEnd(element.children[selectionId - 1].firstChild, selectionOffset);

                                } else if (deletedNode == selectionId) {
                                    range.setStart(element.children[selectionId - 1].firstChild, newNodes[selectionId - 1].text.length);
                                    range.setEnd(element.children[selectionId - 1].firstChild, newNodes[selectionId - 1].text.length);

                                } else if (deletedNode > selectionId) {
                                    range.setStart(element.children[selectionId].firstChild, selectionOffset);
                                    range.setEnd(element.children[selectionId].firstChild, selectionOffset);
                                }
                            }

                            window.getSelection().addRange(range);
                        }

                        isRemoteUpdate = false;
                    }
                });

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