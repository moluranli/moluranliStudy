

# 流程

[【编程不良人】2020最新版Shiro教程,整合SpringBoot项目实战教程_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1uz4y197Zm?p=12&spm_id_from=pageDriver)

![image-20220409222104049](https://s2.loli.net/2022/04/27/dA15W8iCvZbKcgt.png)


# 项目

## 一 注册加密md5+salt+hash散列

### 项目启动的目录为指定的html文件

重写WebMvcConfigurer配置类里的addViewControllers方法,同时也可以使用相同的语法免action调用页面

> **registry.addViewController("/").setViewName("registered");**表示启动时键入registered页面

```java
@Configuration
public class MyWebConfigurer implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        WebMvcConfigurer.super.addViewControllers(registry);
        registry.addViewController("/").setViewName("registered");
        registry.addViewController("/private").setViewName("private");
        registry.addViewController("/returnlogin").setViewName("login");
    }
}
```



### ShiroConfig配置类

分别创建ShiroFilter,SecurityManager,Realm

**Realm**:可以通过自定义一个CustomerRealm来控制对数据库的访问,其中包含认证以及授权的两个方法,在这里验证数据库用户以及密码的正确性

**SecurityManager**:需要建立Default**Web**SecurityManager,把其加入SecurityUtils.

**shiroFilterFactoryBean**:shiro的过滤器,类似于SpringBoot的拦截器,可以对于资源页面的控制访问

> shiroFilterFactoryBean含有方法: shiroFilterFactoryBean.setFilterChainDefinitionMap(map); 需要定义一个map,map的key为需要访问资源页面的action,value为filter自己的权限信息,比如authc为进行认证以及授权.常见的如下:
>
![image-20220410153906205](https://s2.loli.net/2022/04/27/rD6utsNcaGXJyi5.png)

```java
@Configuration
public class ShiroConfig {
    //配置ShiroFilter配置Shiro的过滤器
    @Bean(name = "shiroFilterFactoryBean")
    public ShiroFilterFactoryBean getShiroFilterFactoryBean(DefaultWebSecurityManager DefaultWebSecurityManager){
        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
        //添加受限资源
        Map<String,String> map = new HashMap<>();
        map.put("/private","authc");//authc代表认证和授权
        //添加没有进行认证和授权,会默认返回的页面
        shiroFilterFactoryBean.setLoginUrl("/returnlogin");
        shiroFilterFactoryBean.setFilterChainDefinitionMap(map);
        shiroFilterFactoryBean.setSecurityManager(DefaultWebSecurityManager);
        return shiroFilterFactoryBean;
    }

    //配置安全管理器
    @Bean
    public DefaultWebSecurityManager getDefaultSecurityManager(Realm realm){
        DefaultWebSecurityManager defaultSecurityManager = new DefaultWebSecurityManager();
        defaultSecurityManager.setRealm(realm);
        return defaultSecurityManager;
    }

    @Bean
    public Realm getRealm(){
        return new CustomerRealm();
    }
}
```



### 登录

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>登录</title>
</head>
<body>
    <form action="/user/login">
        <input type="text" name="username" placeholder="username"><br>
        <input type="password" name="password" placeholder="password"><br>
        <input type="submit" value="登录">
    </form>
</body>
</html>
```



### 登录controller

从SecurityUtils中获取Subject对象,使用subject中的login方法可以判断登录,因为login的参数为Token,所以要将用户名和密码封装成一个Toker,new UsernamePasswordToken(username,password),登录成功就可以访问资源页面

同时登出也有一个Subject.logout:登出

>UnknownAccountException  用户名异常

> IncorrectCredentialsException 密码异常

```java
@RequestMapping("/login")
public String login(String username, String password){
    Subject subject = SecurityUtils.getSubject();
    try {
        subject.login(new UsernamePasswordToken(username,password));
        return "redirect:/private";
    } catch (UnknownAccountException e){
        System.out.println("用户名错误");
        e.printStackTrace();
    } catch (IncorrectCredentialsException e){
        System.out.println("密码错误");
        e.printStackTrace();
    }
    return "redirect:/returnlogin";
}
```



### 数据库



![image-20220410155222468](https://s2.loli.net/2022/04/27/drxO9aboLNzDBsV.png)



### 注册

```html
<form action="/user/registered">
    <input type="text" name="username" placeholder="username"><br>
    <input type="password" name="password" placeholder="password"><br>
    <input type="submit" value="注册">
</form>
```



### 使用mybatis的insert

> @Options(useGeneratedKeys = true,keyProperty = "id",keyColumn = "id")使用自增策略时需要在数据库中也要设置Auto inc自增,否则会报错,没有id

```java
@Repository
@Mapper
public interface UserDao {
    @Insert("insert into t_user(id,username,password,salt) values(#{id},#{username},#{password},#{salt})")
    @Options(useGeneratedKeys = true,keyProperty = "id",keyColumn = "id")
    void save(User user);
}
```



### Service层:md5+salt+hash散列

根据写的SaltUtils里的getsalt静态方法产生salt,saltutils的get方法就是传入一个int n,在指定char输入中进行一个n层的随机查找,然后返回,同时在save方法中将password和salt保存

```java
public void save(User user) {
    //对用户输入的密码进行md5加密+salt+hash散列
    String salt = SaltUtils.getSalt(6);//根据写的SaltUtils里的getsalt静态方法产生salt
    user.setSalt(salt);
    Md5Hash md5Hash = new Md5Hash(user.getPassword(),salt,1024);
    user.setPassword(md5Hash.toHex());//将加密后的密码存入
    userDao.save(user);
}
```



### 注册controller

调用了Service的保存方法

```java
@RequestMapping("/registered")
public String registered(User user){
    try {
        userService.save(user);
        return "redirect:/returnlogin";
    } catch (Exception e) {
        e.printStackTrace();
    }
    return "/registered";
}
```



## 二.登录验证

### 用户注册时

输入用户名以及密码,然后调用将密码加密后存入数据库中,

```java
String salt = SaltUtils.getSalt(6);//根据写的SaltUtils里的getsalt静态方法产生salt
user.setSalt(salt);
Md5Hash md5Hash = new Md5Hash(user.getPassword(),salt,1024);
user.setPassword(md5Hash.toHex());//将加密后的密码存入
```

### 在进行登录之前

需要先告诉自定义realm使用的是md5加密以及散列的次数

```java
HashedCredentialsMatcher credentialsMatcher = new HashedCredentialsMatcher();
credentialsMatcher.setHashAlgorithmName("MD5");
credentialsMatcher.setHashIterations(1024);
customerRealm.setCredentialsMatcher(credentialsMatcher);
```

### 在登录时

```java
subject.login(new UsernamePasswordToken(username,password));
```

### 进行验证,会跳转到自定义的Realm中

```java
String principal = (String) token.getPrincipal();
User user = userService.findUserByUserName(principal);
if (!ObjectUtils.isEmpty(user)){
    return new SimpleAuthenticationInfo(user.getUsername(), user.getPassword(), ByteSource.Util.bytes(user.getSalt()), this.getName());
}
return null;
```

通过用户名拿到当前用户后返回

![image-20220410171915636](https://s2.loli.net/2022/04/27/6R5aqXxDevyntWM.png)

## redis缓存处理

### 自定义realm开启缓存



```java
//使用redis缓存
customerRealm.setCacheManager(new RedisCacheManager());//使用自定义缓存类
customerRealm.setCachingEnabled(true);
customerRealm.setAuthenticationCachingEnabled(true);
customerRealm.setAuthenticationCacheName("authenticationCache");
customerRealm.setAuthorizationCachingEnabled(true);
customerRealm.setAuthorizationCacheName("authorizationCache");
```



自定义缓存类继承CacheManager,并且存入缓存名称

```java
public class RedisCacheManager implements CacheManager {
    @Override
    public <K, V> Cache<K, V> getCache(String name) throws CacheException {
         return new RedisManager<K,V>(name);
    }
}

```



### Redis缓存实现类

```java
public class RedisManager<K,V> implements Cache<K,V> {

    private String cacheName;

    public RedisManager() {
    }

    public RedisManager(String cacheName) {
        this.cacheName = cacheName;
    }

    @Override
    public V get(K key) throws CacheException {
        return (V)getRedisTemplate().opsForHash().get(this.cacheName,key.toString());
    }

    @Override
    public V put(K key, V value) throws CacheException {
        System.out.println("put key"+key);
        System.out.println("put value"+value);
        getRedisTemplate().opsForHash().put(this.cacheName,key.toString(),value);
        return null;
    }

    @Override
    public V remove(K key) throws CacheException {
        return (V) getRedisTemplate().opsForHash().delete(this.cacheName,key.toString());
    }

    @Override
    public void clear() throws CacheException {
        getRedisTemplate().opsForHash().delete(this.cacheName);
    }

    @Override
    public int size() {
        return getRedisTemplate().opsForHash().size(this.cacheName).intValue();
    }

    @Override
    public Set<K> keys() {
        return getRedisTemplate().opsForHash().keys(this.cacheName);
    }

    @Override
    public Collection<V> values() {
        return getRedisTemplate().opsForHash().values(this.cacheName);
    }

    private RedisTemplate getRedisTemplate(){
        RedisTemplate redisTemplate = (RedisTemplate) ApplicationContextUtils.getBean("redisTemplate");
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        return redisTemplate;
    }
}
```



### 使用RedisTemplate

不能使用Authwired指定否则报错,需要使用工厂

```java
@Component
public class ApplicationContextUtils implements ApplicationContextAware {

    private static ApplicationContext context;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.context = applicationContext;
    }

    public static Object getBean(String beanName){
        return context.getBean(beanName);
    }
}
```



### 对salt也进行序列化

需要对salt进行序列化,否则会包序列化异常

```java
public class MyByteSource implements ByteSource, Serializable {
    private byte[] bytes;
    private String cachedHex;
    private String cachedBase64;

    public MyByteSource() {
    }

    public MyByteSource(byte[] bytes) {
        this.bytes = bytes;
    }

    public MyByteSource(char[] chars) {
        this.bytes = CodecSupport.toBytes(chars);
    }

    public MyByteSource(String string) {
        this.bytes = CodecSupport.toBytes(string);
    }

    public MyByteSource(ByteSource source) {
        this.bytes = source.getBytes();
    }

    public MyByteSource(File file) {
        this.bytes = (new MyByteSource.BytesHelper()).getBytes(file);
    }

    public MyByteSource(InputStream stream) {
        this.bytes = (new MyByteSource.BytesHelper()).getBytes(stream);
    }

    public static boolean isCompatible(Object o) {
        return o instanceof byte[] || o instanceof char[] || o instanceof String || o instanceof ByteSource || o instanceof File || o instanceof InputStream;
    }

    public byte[] getBytes() {
        return this.bytes;
    }

    public boolean isEmpty() {
        return this.bytes == null || this.bytes.length == 0;
    }

    public String toHex() {
        if (this.cachedHex == null) {
            this.cachedHex = Hex.encodeToString(this.getBytes());
        }

        return this.cachedHex;
    }

    public String toBase64() {
        if (this.cachedBase64 == null) {
            this.cachedBase64 = Base64.encodeToString(this.getBytes());
        }

        return this.cachedBase64;
    }

    public String toString() {
        return this.toBase64();
    }

    public int hashCode() {
        return this.bytes != null && this.bytes.length != 0 ? Arrays.hashCode(this.bytes) : 0;
    }

    public boolean equals(Object o) {
        if (o == this) {
            return true;
        } else if (o instanceof ByteSource) {
            ByteSource bs = (ByteSource)o;
            return Arrays.equals(this.getBytes(), bs.getBytes());
        } else {
            return false;
        }
    }

    private static final class BytesHelper extends CodecSupport {
        private BytesHelper() {
        }

        public byte[] getBytes(File file) {
            return this.toBytes(file);
        }

        public byte[] getBytes(InputStream stream) {
            return this.toBytes(stream);
        }
    }
}
```