function timeStampUrl(url) {
  const t = `_=${Date.now()}`
  if (url.indexOf('?') >= 0) {
    return `${url}&${t}`
  } else {
    return `${url}?${t}`
  }
}

/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {cb}
 */
function getBlob(url, cb) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'
  xhr.onload = () => {
    if (xhr.status === 200) {
      cb(xhr.response)
    }
  }
  xhr.send()
}

/**
 * 保存
 * @param  {Blob} blob
 * @param  {String} filename 想要保存的文件名称
 */
function saveAs(blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename)
  } else {
    var link = document.createElement('a')
    var body = document.querySelector('body')

    link.href = window.URL.createObjectURL(blob)
    link.download = filename

    // fix Firefox
    link.style.display = 'none'
    body.appendChild(link)

    link.click()
    body.removeChild(link)

    window.URL.revokeObjectURL(link.href)
  }
}

/**
 * 下载
 * @param  {String} url 目标文件地址
 * @param  {String} filename 想要保存的文件名称
 * 将此方法暴露出去
 */
function download(url, filename) {
  getBlob(timeStampUrl(url), blob => {
    saveAs(blob, filename)
  })
}

export default { download }
