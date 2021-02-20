function add(numA, numB) {
  // 错误处理
  if (!numA || !numB) {
    throw new Error('错误码-1，输入值不能为空')
  }

  const validateRegExp = /^-?[a-zA-Z]+$/
  if (!validateRegExp.test(numA) || !validateRegExp.test(numB)) {
    throw new Error('错误码-2，输入值不是有效的52进制字符')
  }


  // 生成52进制字符及对应的十进制值map，和十进制值对应的52进制字符map
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const upperCase = lowercase.toUpperCase()
  const strings = lowercase + upperCase
  const entries = {
    valueKey: [],
    keyValue: []
  }
  const valueKey = strings.split('').forEach((item, index) => {
    entries.valueKey.push([item, index])
    entries.keyValue.push([index, item])
  })
  const valueKeyMap = new Map(entries.valueKey)
  const keyValueMap = new Map(entries.keyValue)


  // 初始化AB对应的值和符号标识，初始化最终结果正负标识
  let flagA = flagB = flag = ''
  let valueA = numA
  let valueB = numB

  // 对AB的值和符号做进一步处理
  if (/-/.test(numA)) {
    flagA = '-'
    valueA = numA.substr(1)
  }

  if (/-/.test(numB)) {
    flagB = '-'
    valueB = numB.substr(1)
  }

  // 对符号标识进行处理，统一成A - B 和 A + B情形

  if (flagA === flagB || flagA === '-') {
    // + +、- +、- -三种情况时，全局flag以A为准，例如++为+，- -为-，- +为-，因为可以提出一个
    // -号，统一成A - B的情形
    flag = flagA
  }

  if (flagA === '-' && flagB === '-') {
    // - -时提出一个-号，需要额外处理flagB为+
    flagB = ''
  }

  let result = '' // 结果
  let identifier = 0 // 进位标识
  let i = valueA.length - 1
  let j = valueB.length - 1

  while (i >= 0 || j >= 0) {
    // 从尾向前，取出对应的十进制值，如果当前位为空则补0
    const a = valueA.charAt(i) || 'a'
    const b = valueB.charAt(j) || 'a'
    const numberA = valueKeyMap.get(a)
    const numberB = valueKeyMap.get(b)


    if (flagB === '-') {
      // A - B
      let deference = 0
      if (numberA + identifier < numberB) {
        // 被减数加上进位后小于减数时，借位相减，并标识进位为-1
        deference = numberA + identifier + 52 - numberB
        identifier = -1
      } else {
        // 否则直接相减，进位归0
        deference = numberA + identifier - numberB
        identifier = 0
      }
      // 在结果前面加上当前位的值
      result = keyValueMap.get(deference) + result
    } else {
      // A + B
      let sum = numberA + identifier + numberB
      // 相加大于等于52则进位
      if (sum >= 52) {
        sum -= 52
        identifier = 1
      } else {
        identifier = 0
      }
      // 在结果前面加上当前位的值
      result = keyValueMap.get(sum) + result
    }

    i--
    j--
  }

  // 如果最终identifier为-1，代表为负数
  if (identifier === -1) {
    flag = '-'
  }

  // 如果最终identifier为1，代表最后位相加满52，需进1
  if (identifier === 1) {
    result = 'b' + result
  }

  return flag + result
}

try {
  // console.log(add('', '')) // -1错误，值不能为空
  console.log(add('12', 'a')) // -2错误，输入值不是有效的52进制字符
} catch (error) {
  console.log(error)
}

console.log(add('a', 'a')) // a
console.log(add('A', '-A')) // a
console.log(add('a', '-A')) // -A
console.log(add('-A', 'a')) // -A
console.log(add('-A', '-A')) // -ba
console.log(add('Aa', 'b')) // Ab
console.log(add('AA', 'bb')) // BB
console.log(add('AbC', 'a')) // AbC
console.log(add('AAB', 'AAB')) // bbbc