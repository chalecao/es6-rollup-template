import { defaultImg } from '../util/helper'

let state = {}

const action = {
    getImg: (url) => {
        return url && url.match('//') ? url : defaultImg
    },
    getImgCls: (url) => {
        return url && url.match('//') ? 'product-img h2-lazyload' : 'product-img h2-lazyload placeholder'
    },
    getTag: (txt) => {
        if (txt) return `<span class='tag'>${txt}</span>`;
        else return '';
    },
    render: (data) => {
        return cardView(data, action)
    }
}

const cardView = ({ itemUrl, itemId, itemImg, shortTitle, specDetail, itemPrice, activityTag, cardCount, promoteInfo }, { getImgCls, getImg, getTag }) => {
    return `<a href="${itemUrl}" data-spm="${itemId}" target="_blank" class="product-card-box"> <div class="product-card product-card-${cardCount}" data-id="${itemId}">
        <div class='preview'>
            <img class="${getImgCls(itemImg)}" src="${defaultImg}" data-src="${getImg(itemImg)}" />
            ${getTag(activityTag)}
        </div>
        <div class='content'>
            <div class='item-title'>${shortTitle ? shortTitle.slice(0, 8) : ''}</div>
            <div class='desc'><span>${specDetail ? specDetail.split('+')[0] : ''}</span></div>
            <div class='promote-info'><span>${promoteInfo ? promoteInfo : ''}</span></div>
            <div class='info'>
                <span class='price-label'>&yen;</span>
                <span class='price'>${itemPrice || ""}</span>
                <div class='icon-cart j_AddCart' data-itemid='${itemId}' data-pic='${getImg(itemImg)}' >
                    <svg xmlns='http://www.w3.org/2000/svg' version='1' viewBox='0 0 1077 1024'><path d='M267 879a70 70 0 1 1 0 139 70 70 0 0 1 0-139zm605 0a70 70 0 1 1 0 139 70 70 0 0 1 0-139zm37-131H255l-50-474h776l-72 474zm145-537a38 38 0 0 0-29-13H197L179 31a38 38 0 0 0-38-34H18v76h89l76 717c2 19 19 34 38 34h720a38 38 0 0 0 38-33l84-549a38 38 0 0 0-9-31z'></path></svg>
                </div>
            </div>
        </div>
    </div></a>`
}

export default action