#include "topics-initial_data.cpp"

// use abstract class for doing it
class Communications
{
public:
    virtual void handle_metainfo(std::string mesage);
    virtual void handle_robot_name_commands(const struct mosquitto_message *message);
    virtual void handle_robot_name_moved(const struct mosquitto_message *message)
};