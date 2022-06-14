

# 简介

## 依赖技术

![image-20220504102821998](https://s2.loli.net/2022/05/04/zUXVM2FS1yWElPb.png)

## 开发环境

![image-20220504102911708](https://s2.loli.net/2022/05/04/fTzDZtREnVH8Kye.png)

# 阶段1:项目环境搭建

## 导入依赖

```xml
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.2.2</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
```

## application.properties文件

```properties
debug=true

logging.level.com.example.forum_practice=debug

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/forum?characterEncoding=utf-8&useSSL=false&serverTimezone=Hongkong
spring.datasource.username=root
spring.datasource.password=123
```



# 阶段2:论坛首页开发

## 要点

### 思路

1. 根据数据库查出所有的帖子,然后根据每一个帖子查出帖子对应的用户信息
2. 将每一个以Map存储的帖子+用户存入进入List中
3. 创建一个Page类来实验分页,其中包含的属性包括:当前页码,每一页最大行数,总行数并且通过函数以及上述属性计算:起始行,最后一页的页码,并且得到当前页的前两页和后两页
4. 在cotroller层中对page类的属性进行设置
5. 将存储帖子和用户的List以及Page传入前端页面
6. 使用thmeleaf对属性进行读取或设置比如`th:href="@{/(current=${page.current-1})}"`代表点击跳转下一页

### 配置文件

```properties
#将驼峰命名法与属性匹配,不然数据库中含有_的字段查询出来是null
mybatis.configuration.mapUnderscoreToCamelCase=true
#mapper编译后在classes下,不然会显示dao层接口和xml找不到异常
mybatis.mapper-locations=classpath:mapper/*.xml
#实体类放在那里
mybatis.type-aliases-package=com.example.forum_practice.entity
```

### 控制层

使用List<Map<>>结构来存储帖子以及对应用户的集合,先拿出所有的帖子,然后在通过帖子查找每一用户,存入map中

```java
List<Map<String,Object>> discusspostuserlist = new ArrayList<>();
```

`new map()` 需要放在循环中,否则每次都会因为是同一个对象覆盖数据

```java
Map<String,Object> map = new HashMap<>();
map.put("post",discussPost);
User user =userService.findUserById(discussPost.getUserid());
map.put("user",user);
discusspostuserlist.add(map);
```

传出page分页以及贴子和用户的包装

```java
model.addAttribute("page",page);
model.addAttribute("discusspostuserlist",discusspostuserlist);
```

### 页面

[utext和text的区别](https://blog.csdn.net/rongxiang111/article/details/79678765)使用utext可以解析html,比如br

```html
th:utext="${map.post.title}"
```

thymeleaf内嵌函数 

`${#dates.format(map.post.createTime,'yyyy-MM-dd HH:mm:ss')}`  将date格式转换

`${#numbers.sequence(page.upPage,page.downPage)}`  从uppage到downpage(包含边界)之间的数字以数组形式输出

thymeleaf使用有动态和静态的属性处理 使用`|静态 动态|`

```html
th:class="|page-item ${page.current==i?'active':''}|"
```

thymeleaf代码复用

```html
<!--th:fragment 在含有代码的加入,起名header-->
<header class="bg-dark sticky-top" th:fragment="header">
    
<!-- th:replace 表示复用名称为header的代码 -->
<header class="bg-dark sticky-top" th:replace="index::header"></header>
```



## 数据库字段

### discuss_post表

> 文章表

```sql
CREATE TABLE `discuss_post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,#文章id
  `user_id` varchar(45) DEFAULT NULL,#文章所属用户id
  `title` varchar(100) DEFAULT NULL,#标题
  `content` text,#内容
  `type` int(11) DEFAULT NULL COMMENT '0-普通; 1-置顶;',#文章类型
  `status` int(11) DEFAULT NULL COMMENT '0-正常; 1-精华; 2-拉黑;',#文章状态
  `create_time` timestamp NULL DEFAULT NULL,#创建时间
  `comment_count` int(11) DEFAULT NULL,#讨论数量,有专门的表,由此字段可以减少查表
  `score` double DEFAULT NULL,#分数,根据热度排行
  PRIMARY KEY (`id`),
  KEY `index_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=281 DEFAULT CHARSET=utf8
```

### User表

> 用户表

```sql
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `salt` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `type` int(11) DEFAULT NULL COMMENT '0-普通用户; 1-超级管理员; 2-版主;',
  `status` int(11) DEFAULT NULL COMMENT '0-未激活; 1-已激活;',
  `activation_code` varchar(100) DEFAULT NULL,
  `header_url` varchar(200) DEFAULT NULL,
  `create_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_username` (`username`(20)),
  KEY `index_email` (`email`(20))
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8
```

## Mapper文件

### 文章mapper

```xml
<mapper namespace="com.example.forum_practice.dao.DiscussPostDao">
    <sql id="select_discusspost">
        id,user_id,title,content,type,status,create_time,comment_count,score
    </sql>

    <select id="findDiscussPost" resultType="DiscussPost">
        select <include refid="select_discusspost"/>
        from discuss_post
        where status != 2
        <if test="userid!=0">
            and user_id = #{userid}
        </if>
        order by type desc, create_time desc
        limit #{offset}, #{limit}
    </select>
</mapper>
```

### 用户mapper

```xml
<mapper namespace="com.example.forum_practice.dao.UserDao">
    <sql id="select_user">
        id,username,password,salt,email,type,status,activation_code,header_url,create_time
    </sql>
    <select id="findUserById" resultType="User">
        select <include refid="select_user"/>
        from user
        where id = #{userid}
    </select>
</mapper>
```

# 阶段3:论坛注册

## 要点

### 思路

1. 先在头部链接上加入注册页面的链接
2. 用户输入信息后,控制层将拿到的User传入Service层
3. 在Service层先判断User属性的合理性,是否为空,是否存在等,如果正常将会调用mapper保存数据,同时在产生Salt和md5密码时,使用UUId的随机数以及`DigestUtils.md5DigestAsHex(key.getBytes())`的md5加密,同时给定一个随机的图片和Code,设置状态为0,表示未激活.
4. 在同一个函数中向用户发送模板邮件,发送信息,其中包含`String url = domin + "/activation/" + u.getId() + "/" + u.getActivationCode();的激活链接,domin为localhost://8080`
5. 函数会返回一个包含错误信息的Map,如果Map为空表示没有错误,那么就会跳转到中间页面,中间页面为提示注册成功,已发送激活信息,如果Map不为空,就会返回到注册页面,并且工具Map中的信息来提示什么地方出现错误.
6. 用户邮箱会收到邮件点击链接后,因为控制层有`@RequestMapping("/activation/{userId}/{code}")`会跳转到这个coltorller,然后调用Service层的激活方法,并且传递Userid和code激活码的参数,然后函数会根据userid查询用户,并且查看激活状态,此时有3种返回信息:1.激活码不相同或者没有这个用户,激活失败 2.激活状态已经为1,重复激活 3.激活成功,
7. 然后控制层会根据激活的函数返回信息判断跳转的页面.

### 配置文件

```properties
#可以回填数据
mybatis.configuration.useGeneratedKeys=true

#设置邮箱
spring.mail.host=smtp.qq.com
spring.mail.username=2285288446@qq.com
spring.mail.password=kwybmouancpadjda
spring.mail.protocol=smtps

#forum自定义域名,激活链接url的前端部分
forum.path.domin=http://localhost:8080
```

### 控制层

这行代码会根据点击 `http://localhost:8080+"/activation/"+userid+"/"+code`跳转到此controller

```java
@RequestMapping("/activation/{userId}/{code}")
```

### Service层

使用`mimeMessageHelper.setText(context,true);`可以让邮件可以识别html语言,为后面邮件模板使用

## Mapper文件

```xml
    <select id="findUserByUserName" resultType="User">
        select <include refid="select_user"/>
        from user
        where username = #{username}
    </select>

    <select id="findUserByEmail" resultType="User">
        select <include refid="select_user"/>
        from user
        where email = #{email}
    </select>

    <insert id="saveUser" parameterType="User" useGeneratedKeys="true" keyColumn="id" keyProperty="id">
        insert into user(username,password,salt,email,type,status,activation_code,header_url,create_time)
        values(#{username},#{password},#{salt},#{email},#{type},#{status},#{activationCode},#{headerUrl},#{createTime})
    </insert>

    <update id="updateUserActive">
        update user
        set status = 1
        where id = #{userid}
    </update>
```

## Utils类

### 邮箱

```java
@Component
public class MailClient {
    private static final Logger logger = LoggerFactory.getLogger(MailClient.class);

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendMail(String to, String subject, String context){
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);
        try {
            mimeMessageHelper.setFrom(from);
            mimeMessageHelper.setTo(to);
            mimeMessageHelper.setSubject(subject);
            mimeMessageHelper.setText(context,true);
            javaMailSender.send(mimeMessageHelper.getMimeMessage());
        } catch (MessagingException e) {
            logger.error("发送邮件失败"+e.getMessage());
        }
    }
}
```

### md5加密

```java
public class CommunityUtil {
    //获取随机字符串
    public static String getRandom(){
        return UUID.randomUUID().toString().replaceAll("-","");
    }

    //md5加密
    public static String md5Encrypt(String key){
        if (StringUtils.isBlank(key)){
            return null;
        }
        return DigestUtils.md5DigestAsHex(key.getBytes());
    }
}
```

# 阶段4:论坛登录

# 要点

### 思路

- 验证码的实现

1. 使用图片验证码生成工具kaptcha
2. 写一个kaptchaConfig配置文件,其中包含一个方法,方法的返回值为Producer,并且其包含两个方法,一个是BufferedImage createImage(),另一个是String createText(),创建图片和创建随机字符,在此方法中配置防干扰等图片设置
3. 在controller配置`@RequestMapping("/kaptcha")`访问路径,并且通过Producer的两个方法生成图片,并使用输出流和图片输入流产生图片,并将文本存入session中,使用`response.setContentType("image/png");`设置图片类型.

- 登录验证

1. 验证验证码(用户输入同session中存储的),验证用户名称,如果用户名存在,则通过用户名称查出用户,并且将验证用户的密码,如果都正确的话,则通过对登录凭证进行设置,并存入数据库中(后期更改到redis中),并将ticket存入map中,如果map中含有ticket,则将ticket存入cookie中,并且设置cookie的路径和过期时间等.

- 拦截设置
  - 对于登录凭证即ticket的拦截设置
    1. 设置一个工具类
    
       

测试
