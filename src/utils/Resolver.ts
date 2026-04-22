// 自定义解析器工厂函数
// resolverName: 解析器名称
// resolverPath: 解析器路径
export default (resolverName: string, resolverPath: string) => {
    return (name: string) => {
        if (name !== resolverName) return
        return {
            name: 'default',
            from: resolverPath
        }
    }
}
