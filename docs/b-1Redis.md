



# Redis

[https://www.bilibili.com/video/BV1Rv41177Af?p=5](https://www.bilibili.com/video/BV1Rv41177Af?p=5)

## 常见的Nosql数据库

- Memcache数据库,Memcache不支持持久化,多线程加锁

- Redis数据库,非关系数据库,在此基础上可以实现主从同步 ,单线程加多路复用技术

- MongoDB数据库

![image-20220416190536589](https://s2.loli.net/2022/04/27/hSzcoVWpOyCuf8R.png)

## Redis底层原理

### 单线程加多路复用技术

> 比如买火车票,三个人买票,三个人都将买票的操作交给到黄牛,这三个人在没拿到票的时候都去干自己的事情,这个时候如果黄牛买到票就会通知对应的那个人来拿票.

这里**“多路”**指的是多个网络连接客户端，**“复用”**指的是复用同一个线程(单进程)。I/O 多路复用其实是使用一个线程来检查多个 Socket 的就绪状态，在单个线程中通过记录跟踪每一个 socket（I/O流）的状态来管理处理多个 I/O 流

![img](https://s2.loli.net/2022/04/27/G81tOe7XFQVUDd5.png)

- (1)一个 socket 客户端与服务端连接时，会生成对应一个套接字描述符(套接字描述符是文件描述符的一种)，每一个 socket 网络连接其实都对应一个文件描述符。
- (2)多个客户端与服务端连接时，Redis 使用 **「I/O 多路复用程序」** 将客户端 socket 对应的 FD 注册到监听列表(一个队列)中。当客服端执行 read、write 等操作命令时，I/O 多路复用程序会将命令封装成一个事件，并绑定到对应的 FD 上。
- (3)**「文件事件处理器」**使用 I/O 多路复用模块同时监控多个文件描述符（fd）的读写情况，当 `accept`、`read`、`write` 和 `close` 文件事件产生时，文件事件处理器就会回调 FD 绑定的事件处理器进行处理相关命令操作。

## Redis常用操作命令

### key操作命令

```bash
keys *//查看数据库中的所有key

del key//删除key

exists key//查看key是否存在

expire key 10//设置10秒过期时间,key需要存在

ttl key查看还有多少秒
```

### 数据库操作

```bash
select 0//切换数据库,默认为0,共有16个数据库

dbsize // 查看当前数据库key的数量

flushdb//清空当前数据库

flushall//清空所有数据库
```

## Redis五大数据类型

### 1. String

介绍

![image-20220416200623992](https://s2.loli.net/2022/04/27/kpN5nsUvVJbAXPO.png)

常用命令

```bash
set key value//设置key-value值

get key//获取key对应的value

append key value//将value加在key对应的value后面,并且返回加入后字符串的长度

strlen key//获取key对应value的长度

setnx key value 只有在key不存在时,才能设置 

incr key//value是数字的时候,key对应的value加一

decr key//value是数值的时候,key对应的value减一

incrby key 步长//根据设置步长加一

decrby key 步长//根据设置步长减一

mset key value value

......等等
```

redis具有原子性,而java中的i++不是原子性操作

![image-20220416202440927](https://s2.loli.net/2022/04/27/BTDNls1fLwqthuW.png)

### 2.其他数据类型

略

## 新增的三种数据类型

### BitMap

>bitmap里的value都是以01存储

![image-20220418093602214](https://s2.loli.net/2022/04/27/H8Bx4ZdweR6MStq.png)

![image-20220418093732230](https://s2.loli.net/2022/04/27/wlV7UhZ2fcsYDAv.png)

### HyperLogLog

>求集合中不重复元素的个数

![image-20220418093933408](https://s2.loli.net/2022/04/27/hOik26TCjFMAqXS.png)

### Geospaatial

> 用于地理位置

![image-20220418094107207](https://s2.loli.net/2022/04/27/nS64Oowpyia8CQH.png)

## Redis事务和锁机制

![image-20220417161653903](https://s2.loli.net/2022/04/27/WV649FNneJBp8Uc.png)

### Multi, Exec,Discard

![image-20220417161856176](https://s2.loli.net/2022/04/27/dfEMvO8xcsRIKri.png)

### 事务的错误处理

如果在组队的时候任何一个命令错误,队列将会被取消.

```bash
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> set k3
(error) ERR wrong number of arguments for 'set' command
127.0.0.1:6379(TX)> exec
(error) EXECABORT Transaction discarded because of previous errors.
```



如果在执行阶段某一个命令报错,只有报错的命令不会执行

```bash
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> incr k1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> exec
1) OK
2) (error) ERR value is not an integer or out of range
3) OK
```

### 事务的冲突问题

>账户一共有10000
>
>同时有三个请求:
>
>第一个请求拿8000元,  第二个请求拿4000元,   第三个请求拿1000元

#### 悲观锁

给事务加上锁,需要执行时需要拿到锁才能执行下一步操作.

![image-20220417163520543](https://s2.loli.net/2022/04/27/T4nNQrc3Gs6fYD1.png)

#### 乐观锁 

给事务加一个版本号,每个人都能拿到这个版本号,他们执行对应操作后,快的那个人执行完相应操作后就会将版本号更新,另一个人操作时,会相比较自己获取的版本号与当前的版本是否相同,如果不相同就会重新设置自己获取的版本号.然后继续竞争执行操作

![image-20220418204252274](https://s2.loli.net/2022/04/27/J9YEPzsI1XioLy6.png)

### 事务的乐观锁命令操作

> 使用watch,取消监视使用unwatch

开启两个窗口使用同一数据,在两个窗口中都使用watch是key进行监视,同时设置key的值,使用multi将操作加入队列中,在其中一个窗口中执行exec命令,命令成功运行,但是执行另外一个的时候,会发现版本号不对造成执行失败

其中一个窗口

```bash
127.0.0.1:6379> set k1 10
OK
127.0.0.1:6379> watch k1
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> incrby k1 100
QUEUED
127.0.0.1:6379(TX)> exec
1) (integer) 110
127.0.0.1:6379>
```

另一个窗口

```bash
127.0.0.1:6379> get k1
"10"
127.0.0.1:6379> watch k1
OK
127.0.0.1:6379> multi
OK
127.0.0.1:6379(TX)> incrby k1 200
QUEUED
127.0.0.1:6379(TX)> exec
(nil)
```

### redis事务的三大特性

![image-20220418094423786](https://s2.loli.net/2022/04/27/lsjMmJxFLQkNtAU.png)

## Redis事务实例:秒杀

### 代码

```java
public class SecKillServiceImpl {
    public static boolean SecKill(){
        String userid = (new Random().nextInt(1000)+10000)+"";
        String productid = "0101";

        String prokey = "pro:"+productid;
        String userkey = "user:"+productid;

        Jedis jedis = new Jedis("127.0.0.1",6379);

        jedis.watch(prokey);

        if (jedis.get(prokey)==null){
            System.out.println("商品不存在");
            jedis.close();
            return false;
        }

        if (Integer.valueOf(jedis.get(prokey))<=0){
            System.out.println("商品已售完");
            jedis.close();
            return false;
        }

        if (jedis.sismember(userkey,userid)){
            System.out.println("你已参与过秒杀");
            jedis.close();
            return false;
        }

        Transaction multi = jedis.multi();

        multi.decr(prokey);
        multi.sadd(userkey,userid);

        List<Object> exec = multi.exec();

        if (CollectionUtils.isEmpty(exec)||exec.size()==0){
            System.out.println("秒杀失败");
            jedis.close();
            return false;
        }
        System.out.println("秒杀成功");
        return true;
    }
}

```

### 问题

单纯不是用事务的时候,使用jmeter进行高并发测试,会出现库存为-1的情况,这个时候就需要使用jedis.multi进行事务的管理

>```java
>//代码中以下改为事务
>Transaction multi = jedis.multi();
>
>multi.decr(prokey);
>multi.sadd(userkey,userid);
>
>List<Object> exec = multi.exec();
>
>if (CollectionUtils.isEmpty(exec)||exec.size()==0){
>System.out.println("秒杀失败");
>jedis.close();
>return false;
>}
>```

同时会有read time out的错误出现

使用jedispoot,jedis连接池可以解决此问题

[https://www.bilibili.com/video/BV1Rv41177Af?p=26](https://www.bilibili.com/video/BV1Rv41177Af?p=26)

再将库存设为500,线程设为5000时,会出现库存滞销问题,即线程跑完仍然有库存,原因是因为几个线程同时执行操作时,只有一个成功,其他的因为版本号不同会失败,使用LUA脚本解决

## Redis的持久化操作

### 1. RDB

> 使用写实复制技术

在进行修改的时候,会先fork一个子进程,这个子进程会先生成一个存储数据的临时文件,然后在通过临时文件修改dump.rdb文件,这么做是为了防止如果直接保存到dump.rdb时,如果服务器异常,那么dump.rdb文件中保存的数据不完整.

![image-20220419100432975](https://s2.loli.net/2022/04/27/cRqA253KUgXjN97.png)

### 2. AOF

> 以日志的形式记录每一次写操作,只允许追加文件,redis重新启动时就会读这个文件,执行文件操作

会生成appendonly.aof文件,aof默认关闭,当aof和rdb都开启时,使用aof

![image-20220419104512045](https://s2.loli.net/2022/04/27/fWVnAuNsOLaUkRm.png)![image-20220419104610301](https://s2.loli.net/2022/04/27/rwMa9Y45s3jTgZq.png)![image-20220419104639510](C:\Users\full\AppData\Roaming\Typora\typora-user-images\image-20220419104639510.png)



aof存在bug,造成恢复数据出错.

## Redis主从复制

### 复制原理

> 在从服务器连接主服务器的时候,从服务器会先主服务器发出一个请求,主服务器收到请求后,会持久化自己的数据,生成.rdb的文件,然后将文件传给从服务器,这样从服务器就会有数据了
>
> 在主服务器进行写数据的时候,主服务器会自动发起同步从服务器

![image-20220419141257577](https://s2.loli.net/2022/04/27/lofiByWXqFRJd41.png)

### 设置服务:windows下

![image-20220419124344545](https://s2.loli.net/2022/04/27/AwnFXoVlWTJMGhD.png)

在从服务器的redis.windows.conf配置对应的端口号

> slaveof ip地址 端口号//连接主服务器的ip地址和端口号

使用对应命令启动三个redis服务

> .\redis-server.exe redis.windows.conf

然后开启对应的三个服务

> .\redis-cli.exe -p 6379

### 一主多从

只允许主服务器进行写操作,写入之后,从服务器同样具有数据,不允许从服务区进行写操作,会报如下错误

```bash
127.0.0.1:6380> set k2 v2
(error) READONLY You can't write against a read only slave.
```

### 常用操作

#### 一主二仆

1. 如果从服务器消失,同时在配置文件中没有指定slaveof即没有配置关联的话,从服务器重启后会变为主服务器,需要重新使用命令slaveof命令重新变为主服务器(如果配置文件中配置了slaveof的话,从服务器重启后还是从服务器)
2. 如果主服务器消失,从服务器还是从服务器,只是不能从主服务器同步数据,如果主服务器重启后,就会同步数据
3. 从服务器重启后,会同步主服务器中的所有数据.

#### 薪火相传

将一台从服务器改为另一台从服务器的主服务器

使用 slaveof ip port

一台从服务器消失,后面的从服务器就会失效, 主机消失,从服务器还是从服务器

#### 反客为主

如果主服务器消失,对从服务器使用命令

```bash
slaveof no one
```

就会将从服务器变为主服务器

需要手动完成,可以使用哨兵模式实现自动完成

### 哨兵机制

> 建立一个哨兵对服务器进行监视,如果主服务器消失,那么哨兵会根据redis.conf的配置文件中寻找优先级关系,是优先级高的从服务器变为主服务器,这个时候以前的主服务器也会变成当前主服务器的从服务器
>
> 哨兵选择主服务器根据 1,配置文件设置的优先级 2.和前主服务器相似度最高 3.runid最小
>
> runid redis启动后都会随机 生成对应的40位runid
>
> 系统很繁忙时,复制会有很大延时

#### 操作

建立配置文件 sentinel.conf

输入内容:sentinel monitor mymaster 127.0.0.1 6381 1

然后启动哨兵:./redis-server.exe sentinel.conf --sentinel

这样哨兵就会监视服务器.

sentinel.conf文件内容:会根据当前哨兵选举服务器信息进行自动修改

CONFIG REWRITE: 由将内存中的配置覆盖文件中的配置生成

```bash
6379端口消失后 文件内容
sentinel myid 7b077f767d959b4bbcca3c97d08d3256c7828397
# Generated by CONFIG REWRITE
port 26379
dir "C:\\yzx\\Redis-x64-4.0.2.3"
sentinel monitor mymaster 127.0.0.1 6381 1
sentinel config-epoch mymaster 1
sentinel leader-epoch mymaster 1
sentinel known-slave mymaster 127.0.0.1 6380
sentinel known-slave mymaster 127.0.0.1 6379
sentinel current-epoch 1

6381端口消失后 文件内容
sentinel myid 7b077f767d959b4bbcca3c97d08d3256c7828397
# Generated by CONFIG REWRITE
port 26379
dir "C:\\yzx\\Redis-x64-4.0.2.3"
sentinel monitor mymaster 127.0.0.1 6380 1
sentinel config-epoch mymaster 2
sentinel leader-epoch mymaster 2
sentinel known-slave mymaster 127.0.0.1 6381
sentinel known-slave mymaster 127.0.0.1 6379
sentinel current-epoch 2

```

## Redis集群操作

### 问题

![image-20220419190212275](https://s2.loli.net/2022/04/27/3okV1rT4g5PGIR8.png)

### 主机代理模式

> 使用了较多的服务器,不合理

![image-20220419190331827](https://s2.loli.net/2022/04/27/ZPczsD3K26S7eUt.png)

### 无中心集群方式

> 每一台服务器都可以作为进入集群的入口

![image-20220419190420047](https://s2.loli.net/2022/04/27/Fhb3pwoefWr7zqc.png)

### 集群设置

> 参照视频: [集群操作](https://www.bilibili.com/video/BV1Rv41177Af?p=37&spm_id_from=pageDriver)

![image-20220419192435879](https://s2.loli.net/2022/04/27/EMoKRSYuTsWFkbe.png)

#### Redis集群创建操作

> 首先镜像本身是不能进行相互通信的,所以为了使不同的redis进行通信,需要建立一个新的网络连接,然后使用这个网络连接为每个redis容器分配ip

首先建立新的网络连接

```bash
docker network create redis-cluster
```

然后根据不同的端口号配置redis.conf配置文件

```bash
##节点端口
port 6379

##cluster集群模式
cluster-enabled yes
##集群配置名
cluster-config-file nodes.conf
##超时时间
cluster-node-timeout 5000

## 慢查询
slowlog-log-slower-than 10000
slowlog-max-len 128

## 持久化模式
appendonly yes
## 持久化文件目录

## 内存相关配置
maxmemory 100M

```

然后启动6个redis实例

```bash
docker run -d --name redis6379 -p 6379:6379 -v D:\docker\redis\redis6379.conf:/usr/local/etc/redis/redis.conf --net redis-cluster redis:latest redis-server /usr/local/etc/redis/redis.conf
```

设置映射文件,分配ip 以redis.conf启动redis-server服务

启动了6个之后,可以使用

```bash
docker network inspect redis-cluster
```

参看6个redis容器的ip,然后随便进入一个容器中,使用命令

```bash
redis-cli --cluster create 172.18.0.2:6379  172.18.0.3:6380  172.18.0.4:6381  172.18.0.5:6389  172.18.0.6:6390  172.18.0.7:6391
```

这样就启动了6主的集群

成功输出如下

```bash
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 2730
Master[1] -> Slots 2731 - 5460
Master[2] -> Slots 5461 - 8191
Master[3] -> Slots 8192 - 10922
Master[4] -> Slots 10923 - 13652
Master[5] -> Slots 13653 - 16383
M: e864704c69b0d499ccf0df0a535842d6264fc155 172.18.0.2:6379
   slots:[0-2730] (2731 slots) master
M: 5c5c31de4ce188e679c75f2f06b071601ad7918c 172.18.0.3:6380
   slots:[2731-5460] (2730 slots) master
M: fa1ccf1dd167e88803c034d58a4317f4cffa3f65 172.18.0.4:6381
   slots:[5461-8191] (2731 slots) master
M: 6cae96899614140051787475fed7bba92c44a051 172.18.0.5:6389
   slots:[8192-10922] (2731 slots) master
M: c96605f204ca4d4c5af6f0e4721b1e53c47c4e82 172.18.0.6:6390
   slots:[10923-13652] (2730 slots) master
M: 9a2e098ae80bf1c55a9af765e85354823be3729b 172.18.0.7:6391
   slots:[13653-16383] (2731 slots) master
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.
>>> Performing Cluster Check (using node 172.18.0.2:6379)
M: e864704c69b0d499ccf0df0a535842d6264fc155 172.18.0.2:6379
   slots:[0-2730] (2731 slots) master
M: 6cae96899614140051787475fed7bba92c44a051 172.18.0.5:6389
   slots:[8192-10922] (2731 slots) master
M: fa1ccf1dd167e88803c034d58a4317f4cffa3f65 172.18.0.4:6381
   slots:[5461-8191] (2731 slots) master
M: 5c5c31de4ce188e679c75f2f06b071601ad7918c 172.18.0.3:6380
   slots:[2731-5460] (2730 slots) master
M: c96605f204ca4d4c5af6f0e4721b1e53c47c4e82 172.18.0.6:6390
   slots:[10923-13652] (2730 slots) master
M: 9a2e098ae80bf1c55a9af765e85354823be3729b 172.18.0.7:6391
   slots:[13653-16383] (2731 slots) master
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

使用以下命令,可以创建三主三从的集群模式

```bash
redis-cli --cluster create --cluster-replicas 1 172.18.0.2:6379  172.18.0.3:6380  172.18.0.4:6381  172.18.0.5:6389  172.18.0.6:6390  172.18.0.7:6391
```

输出为以下选项

```bash
root@cbcc8cc52cf5:/data# redis-cli --cluster create --cluster-replicas 1 172.18.0.2:6379  172.18.0.3:6380  172.18.0.4:6381
172.18.0.5:6389  172.18.0.6:6390  172.18.0.7:6391
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 172.18.0.6:6390 to 172.18.0.2:6379
Adding replica 172.18.0.7:6391 to 172.18.0.3:6380
Adding replica 172.18.0.5:6389 to 172.18.0.4:6381
M: 5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb 172.18.0.2:6379
   slots:[0-5460] (5461 slots) master
M: 45bdaa95be16e620e717b1ceb63ca6b708e76e7e 172.18.0.3:6380
   slots:[5461-10922] (5462 slots) master
M: c4b7ac2fe95db71f6cb82c735149cdd9042f8498 172.18.0.4:6381
   slots:[10923-16383] (5461 slots) master
S: 72af79fec080a8388cbff50a12ee3dd732496361 172.18.0.5:6389
   replicates c4b7ac2fe95db71f6cb82c735149cdd9042f8498
S: fe7f44662acd2da9a4701f7640a88f04907cacdf 172.18.0.6:6390
   replicates 5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb
S: 4500df1d1000b51d8abec21595e49b3c68b2c20f 172.18.0.7:6391
   replicates 45bdaa95be16e620e717b1ceb63ca6b708e76e7e
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
.
>>> Performing Cluster Check (using node 172.18.0.2:6379)
M: 5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb 172.18.0.2:6379
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: 72af79fec080a8388cbff50a12ee3dd732496361 172.18.0.5:6389
   slots: (0 slots) slave
   replicates c4b7ac2fe95db71f6cb82c735149cdd9042f8498
M: 45bdaa95be16e620e717b1ceb63ca6b708e76e7e 172.18.0.3:6380
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: 4500df1d1000b51d8abec21595e49b3c68b2c20f 172.18.0.7:6391
   slots: (0 slots) slave
   replicates 45bdaa95be16e620e717b1ceb63ca6b708e76e7e
M: c4b7ac2fe95db71f6cb82c735149cdd9042f8498 172.18.0.4:6381
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
S: fe7f44662acd2da9a4701f7640a88f04907cacdf 172.18.0.6:6390
   slots: (0 slots) slave
   replicates 5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

#### 集群相关操作

##### 卡槽

集群一共有16384个卡槽,一个卡槽存储一个key,

进入任意一个redis-cli -c -p 6379

```bash
127.0.0.1:6379> set k1 v1
-> Redirected to slot [12706] located at 172.18.0.4:6381
OK
172.18.0.4:6381> get k1
"v1"
172.18.0.4:6381> set k2 v2
-> Redirected to slot [449] located at 172.18.0.2:6379
OK
172.18.0.2:6379> get k1
-> Redirected to slot [12706] located at 172.18.0.4:6381
"v1"
```

使用set指令会有一个相关算法计算key的卡槽值,如果当前的key不在当前的服务器,就会跳到key所在的服务器当中

##### 多个key和value

并且不支持一下设置多个key和value,例如

```bash
172.18.0.4:6381> mset k3 v3 k4 v4
(error) CROSSSLOT Keys in request don't hash to the same slot
```

只能使用另一种方式,以组的形式进行多个key和value的设置

```bash
172.18.0.4:6381> mset k3{user} v3 k4{user} v4
-> Redirected to slot [5474] located at 172.18.0.3:6380
OK
```

##### 参看结点情况

```bash
127.0.0.1:6379> cluster nodes
72af79fec080a8388cbff50a12ee3dd732496361 172.18.0.5:6389@16389 slave c4b7ac2fe95db71f6cb82c735149cdd9042f8498 0 1650433619000 3 connected
45bdaa95be16e620e717b1ceb63ca6b708e76e7e 172.18.0.3:6380@16380 master - 0 1650433619534 2 connected 5461-10922
5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb 172.18.0.2:6379@16379 myself,master - 0 1650433619000 1 connected 0-5460
4500df1d1000b51d8abec21595e49b3c68b2c20f 172.18.0.7:6391@16391 slave 45bdaa95be16e620e717b1ceb63ca6b708e76e7e 0 1650433619433 2 connected
c4b7ac2fe95db71f6cb82c735149cdd9042f8498 172.18.0.4:6381@16381 master - 0 1650433618528 3 connected 10923-16383
fe7f44662acd2da9a4701f7640a88f04907cacdf 172.18.0.6:6390@16390 slave 5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb 0 1650433620439 1 connected
```

可以查看结点的情况,包括各主从服务器以及卡槽的分布

##### 其他指令

![image-20220420141852053](https://s2.loli.net/2022/04/27/89QjpHK1amIk5Vg.png)

##### 故障恢复

如果主服务器消失,那么从机将会顶替成为主服务器,并且如果主服务器再次启动后,以前的主服务器会变为从服务器

主服务器消失后,从服务器替代

```bash
5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb 172.18.0.2:6379@16379 master,fail - 1650435645520 1650435643000 1 connected
72af79fec080a8388cbff50a12ee3dd732496361 172.18.0.5:6389@16389 slave c4b7ac2fe95db71f6cb82c735149cdd9042f8498 0 1650435675995 3 connected
fe7f44662acd2da9a4701f7640a88f04907cacdf 172.18.0.6:6390@16390 master - 0 1650435676598 7 connected 0-5460
4500df1d1000b51d8abec21595e49b3c68b2c20f 172.18.0.7:6391@16391 slave 45bdaa95be16e620e717b1ceb63ca6b708e76e7e 0 1650435677001 2 connected
45bdaa95be16e620e717b1ceb63ca6b708e76e7e 172.18.0.3:6380@16380 myself,master - 0 1650435675000 2 connected 5461-10922
c4b7ac2fe95db71f6cb82c735149cdd9042f8498 172.18.0.4:6381@16381 master - 0 1650435676000 3 connected 10923-16383
```

主服务器重启后

```bash
5d16ac1d574e87f2ccaf45cc45560fd4f511a8eb 172.18.0.2:6379@16379 slave fe7f44662acd2da9a4701f7640a88f04907cacdf 0 1650435775575 7 connected
72af79fec080a8388cbff50a12ee3dd732496361 172.18.0.5:6389@16389 slave c4b7ac2fe95db71f6cb82c735149cdd9042f8498 0 1650435776580 3 connected
fe7f44662acd2da9a4701f7640a88f04907cacdf 172.18.0.6:6390@16390 master - 0 1650435776580 7 connected 0-5460
4500df1d1000b51d8abec21595e49b3c68b2c20f 172.18.0.7:6391@16391 slave 45bdaa95be16e620e717b1ceb63ca6b708e76e7e 0 1650435775000 2 connected
45bdaa95be16e620e717b1ceb63ca6b708e76e7e 172.18.0.3:6380@16380 myself,master - 0 1650435775000 2 connected 5461-10922
c4b7ac2fe95db71f6cb82c735149cdd9042f8498 172.18.0.4:6381@16381 master - 0 1650435776077 3 connected 10923-16383
```

如果主服务器和从服务器一起消失,那么会根据redis.conf中的cluster-require-full-coverage是yes还是no,如果是yes,那么整个集群都消失,反之,集群中的其他服务器仍然能够运行

## Redis常见问题及解决

### Redis缓存穿透

![image-20220420203208085](https://s2.loli.net/2022/04/27/8nfYX62NTcjxRIG.png)

#### 造成原因

1. 服务器压力过大
2. 每次都是新数据,在redis中没有缓存,redis缓存命中率低
3. 频繁访问数据库,造成数据库压力过大

#### 解决方法

1. 在redis缓存设置空数据,如果访问数据库时,没有查询到数据,这个时候就对空结果进行缓存,并设置比较短的过期时间.

2. 使用redis的bitmap,类似于白名单,将可以访问的用户id存储,每次访问的时候就与bitmap中的id比较,如果不相同就进行拦截

3. 采用布隆过滤器,底层与bitmap类似

   ![image-20220420202838109](https://s2.loli.net/2022/04/27/fbvj924qIXHCgDO.png)![image-20220420203001035](https://s2.loli.net/2022/04/27/4ZoMKiIFwka1tmC.png)

4. 实际监控,建立黑名单

### Redis缓存击穿

#### 造成原因

![image-20220420203913522](https://s2.loli.net/2022/04/27/Cz7N3i5eGuYmAjW.png)

#### 解决方法

1. 提前设置热点数据的key,延长时间
2. 实时监控数据,延长时间
3. 利用锁,在数据过期时,设置排它锁,如果有线程查询这个key就同步这个缓存,再次等待过期,一直循环,直到没有线程查询key了,就删除这个缓存

### Redis缓存雪崩

#### 造成原因

![image-20220420205001832](https://s2.loli.net/2022/04/27/dMgk2iXIyAYtZSb.png)

#### 解决方法

1. 设置多级缓存机制 redis缓存+nginx缓存+ehcache缓存等
2. 使用锁和队列,控制对数据库的访问,不适合高并发
3. 分开设置缓存过期时间
4. 设置缓存更新标志,如果缓存过期了,启动线程重新拿数据

## 分布式锁

> 在分布式集群中,一台机器上的锁不能在其他机器上使用

![image-20220420210725939](https://s2.loli.net/2022/04/27/dVpXHYSnLFlgmPo.png)

### 基于redis分布锁

使用命令

```bash
setnx k1 v1
```

可以实现加锁,这样其他就不能对其进行再次操作

删除锁使用

```bash
del k1
```

防止死锁expire设置过期时间

同时为了方式上锁之后不能及时设置过期时间,所以上锁和设置过期时间同步进行

```bash
set k1 v1 nx ex 10
```

### 问题1

> a先对key进行上锁处理,然后实行具体操作,然后在这个时候服务器卡顿,此时因为设置了10秒过期时间,锁会自动释放,这个时候b抢到了锁,然后b实行具体操作,这个时候a服务器反应过来,于是继续执行操作,并且执行完之后将b拿到的锁释放

使用java中的uuid解决

![image-20220421103353638](https://s2.loli.net/2022/04/27/mLHKdN7CogXlM9x.png)

### 问题2

> 原子性问题

使用LUA脚本解决

![image-20220421103451902](https://s2.loli.net/2022/04/27/bK2ioJLYRuNsDZ9.png)
